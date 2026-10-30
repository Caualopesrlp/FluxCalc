/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Line,
  Token,
  generateId,
  evaluateTokens,
  recalculateAll,
  updateTokenValue,
  updateTokenLabel,
  formatBrNumber,
} from './utils/calcEngine';
import { Header } from './components/Header';
import { TapeViewport } from './components/TapeViewport';
import { Keypad } from './components/Keypad';
import { NoteModal } from './components/NoteModal';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { PresetSelectorModal } from './components/PresetSelectorModal';
import { ExportModal } from './components/ExportModal';
import { playKeyClick } from './utils/sound';
import { PresetScenario } from './utils/presets';

const STORAGE_KEY = 'fluxcalc_state_v1';

export default function App() {
  // Application State
  const [lines, setLines] = useState<Line[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.lines)) {
          return parsed.lines;
        }
      }
    } catch {
      // Fallback to empty
    }
    return [];
  });

  const [activeLineIndex, setActiveLineIndex] = useState<number>(() => {
    return lines.length > 0 ? Math.max(...lines.map((l) => l.lineIndex)) + 1 : 1;
  });

  const [activeTokens, setActiveTokens] = useState<Token[]>([]);
  const [activeNumberInput, setActiveNumberInput] = useState<string>('');

  // Retroactive inline edit state
  const [editingTarget, setEditingTarget] = useState<{
    lineId: string;
    tokenId: string;
  } | null>(null);
  const [inlineInputValue, setInlineInputValue] = useState<string>('');

  // UI Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    lineId: string;
    tokenId: string;
    tokenValue: string;
    initialLabel: string;
  }>({
    isOpen: false,
    lineId: '',
    tokenId: '',
    tokenValue: '',
    initialLabel: '',
  });

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copyFeedbackToast, setCopyFeedbackToast] = useState<string | null>(null);

  // Line Map lookup for dependency resolution
  const lineMap = useMemo(() => {
    const map = new Map<string, Line>();
    lines.forEach((l) => map.set(l.id, l));
    return map;
  }, [lines]);

  // Total references count for telemetry in Header
  const totalRefsCount = useMemo(() => {
    let count = 0;
    for (const l of lines) {
      for (const t of l.tokens) {
        if (t.type === 'ref') count++;
      }
    }
    for (const t of activeTokens) {
      if (t.type === 'ref') count++;
    }
    return count;
  }, [lines, activeTokens]);

  // Active Draft Line Preview calculation
  const activeDraftResult = useMemo(() => {
    const tempTokens = [...activeTokens];
    if (activeNumberInput) {
      tempTokens.push({
        id: 'draft-temp',
        type: 'number',
        value: activeNumberInput,
      });
    }
    return evaluateTokens(tempTokens, lineMap);
  }, [activeTokens, activeNumberInput, lineMap]);

  // Persist lines to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          lines,
        })
      );
    } catch {
      // Storage quota or disabled in sandbox
    }
  }, [lines]);

  // Sound wrapper
  const playSound = useCallback(
    (type: 'digit' | 'operator' | 'action' | 'equal' | 'cascade') => {
      if (soundEnabled) playKeyClick(type);
    },
    [soundEnabled]
  );

  // -------------------------------------------------------------
  // Calculator Actions
  // -------------------------------------------------------------

  const handleDigit = useCallback(
    (digit: string) => {
      playSound('digit');

      // If in retroactive editing mode
      if (editingTarget) {
        const nextVal =
          inlineInputValue === '0' || inlineInputValue === '' ? digit : inlineInputValue + digit;
        setInlineInputValue(nextVal);
        const { lines: updatedLines, affectedLineIds } = updateTokenValue(
          lines,
          editingTarget.lineId,
          editingTarget.tokenId,
          nextVal
        );
        setLines(updatedLines);
        if (affectedLineIds.size > 1) {
          playSound('cascade');
        }
        return;
      }

      // In active workspace line
      setActiveNumberInput((prev) => {
        if (prev === '0') return digit;
        return prev + digit;
      });
    },
    [editingTarget, inlineInputValue, lines, playSound]
  );

  const handleDecimal = useCallback(() => {
    playSound('digit');

    if (editingTarget) {
      if (!inlineInputValue.includes('.')) {
        const nextVal = inlineInputValue === '' ? '0.' : inlineInputValue + '.';
        setInlineInputValue(nextVal);
        const { lines: updatedLines } = updateTokenValue(
          lines,
          editingTarget.lineId,
          editingTarget.tokenId,
          nextVal
        );
        setLines(updatedLines);
      }
      return;
    }

    setActiveNumberInput((prev) => {
      if (prev.includes('.')) return prev;
      if (prev === '') return '0.';
      return prev + '.';
    });
  }, [editingTarget, inlineInputValue, lines, playSound]);

  const handleOperator = useCallback(
    (op: string) => {
      // Exit retroactive mode if active
      if (editingTarget) {
        setEditingTarget(null);
      }

      playSound('operator');

      const canonicalOp = op === '×' ? '*' : op === '÷' ? '/' : op === '−' ? '-' : op;

      // Case 1: An active number input was being typed
      if (activeNumberInput.trim() !== '') {
        const newToken: Token = {
          id: generateId(),
          type: 'number',
          value: activeNumberInput,
        };
        const opToken: Token = {
          id: generateId(),
          type: 'operator',
          value: canonicalOp,
        };
        setActiveTokens((prev) => [...prev, newToken, opToken]);
        setActiveNumberInput('');
        return;
      }

      // Case 2: activeTokens is empty, but there is a previous line result!
      // In this case, auto-inject previous line result as operand
      if (activeTokens.length === 0 && lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        if (lastLine.result !== null && !lastLine.error) {
          const refToken: Token = {
            id: generateId(),
            type: 'ref',
            value: `L${lastLine.lineIndex}`,
            refLineId: lastLine.id,
            label: lastLine.tokens[0]?.label,
          };
          const opToken: Token = {
            id: generateId(),
            type: 'operator',
            value: canonicalOp,
          };
          setActiveTokens([refToken, opToken]);
          return;
        }
      }

      // Case 3: activeTokens has an operator at the end -> replace it
      if (activeTokens.length > 0 && activeTokens[activeTokens.length - 1].type === 'operator') {
        setActiveTokens((prev) => [
          ...prev.slice(0, -1),
          { id: generateId(), type: 'operator', value: canonicalOp },
        ]);
        return;
      }

      // Case 4: activeTokens ends with number or ref -> append operator
      if (activeTokens.length > 0) {
        setActiveTokens((prev) => [
          ...prev,
          { id: generateId(), type: 'operator', value: canonicalOp },
        ]);
      }
    },
    [editingTarget, activeNumberInput, activeTokens, lines, playSound]
  );

  // Key C: deletes last digit or token in active line / retroactive token
  const handleClearOne = useCallback(() => {
    playSound('action');

    if (editingTarget) {
      if (inlineInputValue.length > 1) {
        const nextVal = inlineInputValue.slice(0, -1);
        setInlineInputValue(nextVal);
        const { lines: updatedLines } = updateTokenValue(
          lines,
          editingTarget.lineId,
          editingTarget.tokenId,
          nextVal
        );
        setLines(updatedLines);
      } else {
        const nextVal = '0';
        setInlineInputValue(nextVal);
        const { lines: updatedLines } = updateTokenValue(
          lines,
          editingTarget.lineId,
          editingTarget.tokenId,
          nextVal
        );
        setLines(updatedLines);
      }
      return;
    }

    // In active line:
    if (activeNumberInput.length > 1) {
      setActiveNumberInput((prev) => prev.slice(0, -1));
    } else if (activeNumberInput.length === 1) {
      setActiveNumberInput('');
    } else if (activeTokens.length > 0) {
      const lastToken = activeTokens[activeTokens.length - 1];
      setActiveTokens((prev) => prev.slice(0, -1));
      if (lastToken.type === 'number') {
        // Allow user to continue editing it
        setActiveNumberInput(lastToken.value);
      }
    }
  }, [editingTarget, inlineInputValue, lines, activeNumberInput, activeTokens, playSound]);

  // Key AC: Sela a conta atual, move a fita visualmente para cima e abre uma nova linha de trabalho zerada
  const handleAllClear = useCallback(() => {
    playSound('action');

    if (editingTarget) {
      setEditingTarget(null);
    }

    const currentTokens = [...activeTokens];
    if (activeNumberInput.trim() !== '') {
      currentTokens.push({
        id: generateId(),
        type: 'number',
        value: activeNumberInput,
      });
    }

    // If current draft has at least 1 number or ref, seal it and save to lines!
    const hasOperand = currentTokens.some((t) => t.type === 'number' || t.type === 'ref');
    if (hasOperand) {
      const evalRes = evaluateTokens(currentTokens, lineMap);
      const newLine: Line = {
        id: generateId(),
        lineIndex: activeLineIndex,
        tokens: currentTokens,
        result: evalRes.result,
        error: evalRes.error,
        isSealed: true,
        timestamp: Date.now(),
      };

      setLines((prev) => [...prev, newLine]);
      setActiveLineIndex((prev) => prev + 1);
    }

    // Reset active workspace tokens and input
    setActiveTokens([]);
    setActiveNumberInput('');
  }, [activeTokens, activeNumberInput, lineMap, activeLineIndex, editingTarget, playSound]);

  // Key =: Calculate, seal line, and start new active line
  const handleEquals = useCallback(() => {
    if (editingTarget) {
      setEditingTarget(null);
      playSound('equal');
      return;
    }

    const currentTokens = [...activeTokens];
    if (activeNumberInput.trim() !== '') {
      currentTokens.push({
        id: generateId(),
        type: 'number',
        value: activeNumberInput,
      });
    }

    const hasOperand = currentTokens.some((t) => t.type === 'number' || t.type === 'ref');
    if (!hasOperand) {
      playSound('action');
      return;
    }

    playSound('equal');

    const evalRes = evaluateTokens(currentTokens, lineMap);
    const newLine: Line = {
      id: generateId(),
      lineIndex: activeLineIndex,
      tokens: currentTokens,
      result: evalRes.result,
      error: evalRes.error,
      isSealed: true,
      timestamp: Date.now(),
    };

    setLines((prev) => [...prev, newLine]);
    setActiveLineIndex((prev) => prev + 1);
    setActiveTokens([]);
    setActiveNumberInput('');
  }, [editingTarget, activeTokens, activeNumberInput, lineMap, activeLineIndex, playSound]);

  // ± Inverter sinal
  const handleToggleSign = useCallback(() => {
    playSound('action');

    if (editingTarget) {
      if (!inlineInputValue || inlineInputValue === '0') return;
      const nextVal = inlineInputValue.startsWith('-')
        ? inlineInputValue.substring(1)
        : '-' + inlineInputValue;
      setInlineInputValue(nextVal);
      const { lines: updatedLines } = updateTokenValue(
        lines,
        editingTarget.lineId,
        editingTarget.tokenId,
        nextVal
      );
      setLines(updatedLines);
      return;
    }

    setActiveNumberInput((prev) => {
      if (!prev || prev === '0') return prev;
      if (prev.startsWith('-')) return prev.substring(1);
      return '-' + prev;
    });
  }, [editingTarget, inlineInputValue, lines, playSound]);

  // % Porcentagem
  const handlePercent = useCallback(() => {
    playSound('operator');

    if (editingTarget) {
      const num = parseFloat(inlineInputValue);
      if (!isNaN(num)) {
        const nextVal = (num / 100).toString();
        setInlineInputValue(nextVal);
        const { lines: updatedLines } = updateTokenValue(
          lines,
          editingTarget.lineId,
          editingTarget.tokenId,
          nextVal
        );
        setLines(updatedLines);
      }
      return;
    }

    if (activeNumberInput) {
      const num = parseFloat(activeNumberInput);
      if (!isNaN(num)) {
        setActiveNumberInput((num / 100).toString());
      }
    }
  }, [editingTarget, inlineInputValue, lines, activeNumberInput, playSound]);

  // Reuse a result from history into active line
  const handleResultClick = useCallback(
    (sourceLineId: string) => {
      const sourceLine = lineMap.get(sourceLineId);
      if (!sourceLine || sourceLine.result === null) return;

      playSound('action');

      // If active number was being typed, seal it first with an operator if needed
      const refToken: Token = {
        id: generateId(),
        type: 'ref',
        value: `L${sourceLine.lineIndex}`,
        refLineId: sourceLine.id,
        label: sourceLine.tokens.find((t) => t.label)?.label,
      };

      if (activeNumberInput) {
        const numToken: Token = {
          id: generateId(),
          type: 'number',
          value: activeNumberInput,
        };
        const plusOp: Token = {
          id: generateId(),
          type: 'operator',
          value: '+',
        };
        setActiveTokens((prev) => [...prev, numToken, plusOp, refToken]);
        setActiveNumberInput('');
      } else if (
        activeTokens.length > 0 &&
        activeTokens[activeTokens.length - 1].type !== 'operator'
      ) {
        // Insert an operator '+' automatically if preceded by a number
        const plusOp: Token = {
          id: generateId(),
          type: 'operator',
          value: '+',
        };
        setActiveTokens((prev) => [...prev, plusOp, refToken]);
      } else {
        setActiveTokens((prev) => [...prev, refToken]);
      }
    },
    [lineMap, activeNumberInput, activeTokens, playSound]
  );

  // Shortcut to reuse last line's result
  const handleReuseLastResult = useCallback(() => {
    if (lines.length === 0) return;
    const last = lines[lines.length - 1];
    handleResultClick(last.id);
  }, [lines, handleResultClick]);

  // Click on any number to trigger retroactive edit
  const handleNumberClick = useCallback(
    (lineId: string, tokenId: string) => {
      const line = lineMap.get(lineId);
      if (!line) return;
      const token = line.tokens.find((t) => t.id === tokenId);
      if (!token || token.type !== 'number') return;

      setEditingTarget({ lineId, tokenId });
      setInlineInputValue(token.value);
      playSound('action');
    },
    [lineMap, playSound]
  );

  // Double click on any number to attach/edit label note
  const handleNumberDoubleClick = useCallback(
    (lineId: string, tokenId: string) => {
      const line = lineMap.get(lineId);
      if (!line) return;
      const token = line.tokens.find((t) => t.id === tokenId);
      if (!token || token.type !== 'number') return;

      setNoteModal({
        isOpen: true,
        lineId,
        tokenId,
        tokenValue: token.value,
        initialLabel: token.label || '',
      });
    },
    [lineMap]
  );

  const handleQuickNote = useCallback(() => {
    // If retroactive editing is active, open note for it
    if (editingTarget) {
      handleNumberDoubleClick(editingTarget.lineId, editingTarget.tokenId);
      return;
    }

    // Or if last token is a number or currently typing number
    if (activeNumberInput) {
      setNoteModal({
        isOpen: true,
        lineId: 'active',
        tokenId: 'current',
        tokenValue: activeNumberInput,
        initialLabel: '',
      });
      return;
    }

    // Or open for last completed line's first number
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const firstNum = lastLine.tokens.find((t) => t.type === 'number');
      if (firstNum) {
        handleNumberDoubleClick(lastLine.id, firstNum.id);
      }
    }
  }, [editingTarget, activeNumberInput, lines, handleNumberDoubleClick]);

  const handleSaveNote = useCallback(
    (label: string) => {
      if (noteModal.lineId === 'active') {
        // If it was for the currently typing number, push token with label
        const newToken: Token = {
          id: generateId(),
          type: 'number',
          value: activeNumberInput,
          label: label.trim().substring(0, 25),
        };
        setActiveTokens((prev) => [...prev, newToken]);
        setActiveNumberInput('');
      } else {
        const updated = updateTokenLabel(lines, noteModal.lineId, noteModal.tokenId, label);
        setLines(updated);
      }
      setNoteModal((prev) => ({ ...prev, isOpen: false }));
    },
    [noteModal, activeNumberInput, lines]
  );

  const handleRemoveNote = useCallback(() => {
    if (noteModal.lineId !== 'active') {
      const updated = updateTokenLabel(lines, noteModal.lineId, noteModal.tokenId, '');
      setLines(updated);
    }
    setNoteModal((prev) => ({ ...prev, isOpen: false }));
  }, [noteModal, lines]);

  // Save / Cancel Inline Edit
  const handleSaveInlineEdit = useCallback(() => {
    setEditingTarget(null);
    playSound('equal');
  }, [playSound]);

  const handleCancelInlineEdit = useCallback(() => {
    if (editingTarget) {
      // Revert token to what it was
      const line = lineMap.get(editingTarget.lineId);
      const token = line?.tokens.find((t) => t.id === editingTarget.tokenId);
      if (token) {
        const { lines: reverted } = updateTokenValue(
          lines,
          editingTarget.lineId,
          editingTarget.tokenId,
          token.value
        );
        setLines(reverted);
      }
    }
    setEditingTarget(null);
  }, [editingTarget, lineMap, lines]);

  // Load a preset scenario
  const handleSelectPreset = useCallback(
    (preset: PresetScenario) => {
      const recalculated = recalculateAll(preset.lines);
      setLines(recalculated.lines);
      setActiveLineIndex(recalculated.lines.length + 1);
      setActiveTokens([]);
      setActiveNumberInput('');
      setEditingTarget(null);
      playSound('cascade');
    },
    [playSound]
  );

  // Clear all history
  const handleConfirmClearAll = useCallback(() => {
    setLines([]);
    setActiveLineIndex(1);
    setActiveTokens([]);
    setActiveNumberInput('');
    setEditingTarget(null);
    setIsClearModalOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    playSound('action');
  }, [playSound]);

  // Copy tape to clipboard
  const handleCopyTape = useCallback(() => {
    if (lines.length === 0) {
      setCopyFeedbackToast('Fita vazia!');
      setTimeout(() => setCopyFeedbackToast(null), 2000);
      return;
    }

    const text = lines
      .map((l) => {
        const expr = l.tokens
          .map((t) => {
            if (t.type === 'operator') return ` ${t.value} `;
            const lbl = t.label ? ` [${t.label}]` : '';
            return `${t.value}${lbl}`;
          })
          .join('');
        const res = l.error ? `Erro: ${l.error}` : formatBrNumber(l.result);
        return `L${l.lineIndex}: ${expr} = ${res}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopyFeedbackToast('Fita copiada com sucesso!');
    setTimeout(() => setCopyFeedbackToast(null), 2000);
  }, [lines]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in standard text inputs like in modals
      const activeEl = document.activeElement;
      if (
        activeEl &&
        activeEl.tagName === 'INPUT' &&
        activeEl.getAttribute('type') === 'text' &&
        !activeEl.classList.contains('font-mono') // allow our inline editor
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === '=' || e.key === 'Enter') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleClearOne();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (editingTarget) {
          handleCancelInlineEdit();
        } else {
          handleClearOne();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleClearOne();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleClearOne,
    editingTarget,
    handleCancelInlineEdit,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Toast feedback */}
      {copyFeedbackToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-black text-xs font-bold px-3 py-2 rounded-xl shadow-lg animate-bounce">
          {copyFeedbackToast}
        </div>
      )}

      {/* Header Bar */}
      <Header
        totalLines={lines.length}
        totalRefs={totalRefsCount}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        onOpenClearConfirm={() => setIsClearModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        onCopyTape={handleCopyTape}
      />

      {/* Viewport Fita Viva (45% a 50% da altura, rolável) */}
      <TapeViewport
        lines={lines}
        activeTokens={activeTokens}
        activeNumberInput={activeNumberInput}
        activeLineIndex={activeLineIndex}
        editingTarget={editingTarget}
        activeDraftResult={activeDraftResult}
        onNumberClick={handleNumberClick}
        onNumberDoubleClick={handleNumberDoubleClick}
        onResultClick={handleResultClick}
        onSaveInlineEdit={handleSaveInlineEdit}
        onCancelInlineEdit={handleCancelInlineEdit}
        onInlineInputChange={(val) => {
          setInlineInputValue(val);
          if (editingTarget) {
            const { lines: updated, affectedLineIds } = updateTokenValue(
              lines,
              editingTarget.lineId,
              editingTarget.tokenId,
              val
            );
            setLines(updated);
            if (affectedLineIds.size > 1) {
              playSound('cascade');
            }
          }
        }}
        inlineInputValue={inlineInputValue}
      />

      {/* Teclado Numérico Fixo (50% a 55% da altura) */}
      <Keypad
        onDigit={handleDigit}
        onOperator={handleOperator}
        onDecimal={handleDecimal}
        onClearOne={handleClearOne}
        onAllClear={handleAllClear}
        onEquals={handleEquals}
        onToggleSign={handleToggleSign}
        onPercent={handlePercent}
        onQuickNote={handleQuickNote}
        onReuseLastResult={handleReuseLastResult}
        hasLastResult={lines.length > 0 && lines[lines.length - 1].result !== null}
        isEditingRetroactive={Boolean(editingTarget)}
        onCancelRetroactive={handleCancelInlineEdit}
        onConfirmRetroactive={handleSaveInlineEdit}
      />

      {/* Modais */}
      <NoteModal
        isOpen={noteModal.isOpen}
        tokenValue={noteModal.tokenValue}
        initialLabel={noteModal.initialLabel}
        onSave={handleSaveNote}
        onRemove={handleRemoveNote}
        onClose={() => setNoteModal((prev) => ({ ...prev, isOpen: false }))}
      />

      <ClearConfirmModal
        isOpen={isClearModalOpen}
        totalLines={lines.length}
        onConfirm={handleConfirmClearAll}
        onClose={() => setIsClearModalOpen(false)}
      />

      <PresetSelectorModal
        isOpen={isPresetsModalOpen}
        onSelect={handleSelectPreset}
        onClose={() => setIsPresetsModalOpen(false)}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        lines={lines}
        onImport={(imported) => {
          const recalculated = recalculateAll(imported);
          setLines(recalculated.lines);
          setActiveLineIndex(recalculated.lines.length + 1);
        }}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
