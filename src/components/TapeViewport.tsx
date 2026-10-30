/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import { Line, Token, formatBrNumber } from '../utils/calcEngine';
import { Tag, Link, AlertTriangle, ArrowRight, CornerDownLeft, Check, X, Pencil } from 'lucide-react';

interface TapeViewportProps {
  lines: Line[];
  activeTokens: Token[];
  activeNumberInput: string;
  activeLineIndex: number;
  editingTarget: { lineId: string; tokenId: string } | null;
  activeDraftResult: { result: number | null; error: string | null };
  onNumberClick: (lineId: string, tokenId: string) => void;
  onNumberDoubleClick: (lineId: string, tokenId: string) => void;
  onResultClick: (lineId: string) => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
  onInlineInputChange: (val: string) => void;
  inlineInputValue: string;
}

export const TapeViewport: React.FC<TapeViewportProps> = ({
  lines,
  activeTokens,
  activeNumberInput,
  activeLineIndex,
  editingTarget,
  activeDraftResult,
  onNumberClick,
  onNumberDoubleClick,
  onResultClick,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onInlineInputChange,
  inlineInputValue,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll down when new sealed line or active tokens are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [lines.length, activeTokens.length, activeLineIndex]);

  // Focus inline input if in edit mode
  useEffect(() => {
    if (editingTarget && inlineInputRef.current) {
      inlineInputRef.current.focus();
      inlineInputRef.current.select();
    }
  }, [editingTarget]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 h-[48%] overflow-y-auto px-3 sm:px-4 py-3 bg-zinc-950 font-sans relative select-none scroll-smooth"
      style={{ minHeight: '40%' }}
    >
      {/* Background tape watermark / paper strip feel */}
      <div className="max-w-2xl mx-auto space-y-3 pb-6">
        {lines.length === 0 && activeTokens.length === 0 && !activeNumberInput && (
          <div className="py-8 text-center text-zinc-500">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Pencil className="w-5 h-5 opacity-60" />
            </div>
            <p className="text-sm font-medium text-zinc-400">A fita está em branco</p>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs mx-auto">
              Digite uma conta no teclado numérico. Pressione <span className="text-emerald-400 font-mono font-bold">=</span> ou <span className="text-amber-400 font-mono font-bold">AC</span> para selar.
            </p>
            <p className="text-[11px] text-zinc-600 mt-2">
              Dica: clique em números anteriores para editar retroativamente, ou duplo clique para adicionar uma nota.
            </p>
          </div>
        )}

        {/* Sealed History Lines */}
        {lines.map((line) => {
          const isReferenced = lines.some((other) =>
            other.tokens.some((t) => t.type === 'ref' && t.refLineId === line.id)
          );

          return (
            <div
              key={line.id}
              className={`group relative rounded-xl p-3 border transition-all duration-300 ${
                line.justRecalculated
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40 animate-pulse'
                  : 'bg-zinc-900/90 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              {/* Header: Line badge & timestamp */}
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-800/50 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-zinc-700/60">
                    L{line.lineIndex}
                  </span>
                  {isReferenced && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400/90 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/40">
                      <Link className="w-3 h-3" />
                      Usado em cascata
                    </span>
                  )}
                  {line.justRecalculated && (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/80 animate-fade-in">
                      Recalculado!
                    </span>
                  )}
                </div>

                <div className="text-zinc-500 font-mono text-[10px]">
                  {new Date(line.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </div>
              </div>

              {/* Tokens Sequence (Fita Viva) */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 font-mono">
                {line.tokens.map((token) => {
                  const isEditingThis =
                    editingTarget?.lineId === line.id && editingTarget?.tokenId === token.id;

                  if (token.type === 'operator') {
                    return (
                      <span
                        key={token.id}
                        className="text-zinc-400 font-bold px-1 text-base select-none"
                      >
                        {token.value === '*' ? '×' : token.value === '/' ? '÷' : token.value}
                      </span>
                    );
                  }

                  if (token.type === 'ref') {
                    return (
                      <div
                        key={token.id}
                        className="relative group/token inline-flex flex-col items-start"
                      >
                        {token.label && (
                          <span className="text-[9px] font-sans text-amber-300 font-medium px-1 bg-amber-950/80 rounded border border-amber-800/60 -mb-1 z-10 truncate max-w-[120px]">
                            {token.label}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/30 text-amber-300 border border-amber-800/50 text-sm font-semibold shadow-inner">
                          <Link className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{token.value}</span>
                        </span>
                      </div>
                    );
                  }

                  // Number Token (Interactive with Retroactive Editing & Double Click Note)
                  return (
                    <div
                      key={token.id}
                      className="relative inline-flex flex-col items-start"
                    >
                      {/* Attached Note/Label Tag */}
                      {token.label && (
                        <div
                          onClick={() => onNumberDoubleClick(line.id, token.id)}
                          className="cursor-pointer text-[10px] font-sans text-emerald-300 font-medium px-1.5 py-0.2 rounded-t-md bg-emerald-950/90 border-t border-x border-emerald-800/80 -mb-px z-10 flex items-center gap-1 hover:brightness-110"
                          title="Clique duas vezes para editar a nota"
                        >
                          <Tag className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="truncate max-w-[120px]">{token.label}</span>
                        </div>
                      )}

                      {/* Token Value Display / Inline Editor */}
                      {isEditingThis ? (
                        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-amber-950/60 border-2 border-amber-400 shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30">
                          <input
                            ref={inlineInputRef}
                            type="text"
                            value={inlineInputValue}
                            onChange={(e) => onInlineInputChange(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') onSaveInlineEdit();
                              if (e.key === 'Escape') onCancelInlineEdit();
                            }}
                            className="w-24 sm:w-28 px-2 py-1 bg-black text-amber-200 font-mono font-bold text-sm rounded border border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-400 text-right"
                            autoFocus
                          />
                          <button
                            onClick={() => onNumberDoubleClick(line.id, token.id)}
                            className="p-1 bg-zinc-800 hover:bg-emerald-950 text-emerald-400 hover:text-emerald-300 rounded transition-colors cursor-pointer"
                            title="Adicionar ou editar nota deste valor"
                            aria-label="Nota deste valor"
                          >
                            <Tag className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={onSaveInlineEdit}
                            className="p-1 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold transition-colors cursor-pointer"
                            title="Confirmar alteração (Enter)"
                            aria-label="Confirmar alteração"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={onCancelInlineEdit}
                            className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors cursor-pointer"
                            title="Cancelar (Esc)"
                            aria-label="Cancelar alteração"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onNumberClick(line.id, token.id)}
                          onDoubleClick={() => onNumberDoubleClick(line.id, token.id)}
                          className={`group/num relative px-2.5 py-1 rounded-lg text-sm sm:text-base font-semibold border transition-all cursor-pointer ${
                            token.label ? 'rounded-t-none' : ''
                          } bg-zinc-800/90 text-zinc-100 hover:text-amber-200 border-zinc-700 hover:border-amber-500/70 hover:shadow-sm hover:shadow-amber-500/10 active:scale-95`}
                          title="Clique para editar este valor retroativamente | Duplo clique para adicionar nota"
                          aria-label={`Editar valor ${token.value}`}
                        >
                          {token.value}
                          <span className="hidden group-hover/num:block absolute -top-5 right-0 text-[9px] font-sans font-normal text-amber-400 bg-black/90 px-1 py-0.5 rounded shadow pointer-events-none">
                            Editar
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Line Result / Error Display */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-1">
                <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-zinc-600" />
                  Resultado da Linha
                </span>

                {line.error ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-800/70 text-red-300 text-xs font-mono font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{line.error}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onResultClick(line.id)}
                    className="group/res flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/60 hover:border-emerald-500 text-emerald-300 font-mono font-bold text-base transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
                    title="Clique para injetar este resultado na conta ativa!"
                    aria-label={`Usar resultado ${formatBrNumber(line.result)} na conta ativa`}
                  >
                    <span className="text-emerald-500 text-xs font-normal font-sans">
                      =
                    </span>
                    <span>{formatBrNumber(line.result)}</span>
                    <span className="text-[10px] text-emerald-400/70 font-sans font-normal opacity-0 group-hover/res:opacity-100 transition-opacity flex items-center gap-0.5">
                      <CornerDownLeft className="w-3 h-3" />
                      Reutilizar
                    </span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Current Active Workspace Draft Line */}
        <div className="sticky bottom-0 z-20 rounded-xl p-3 bg-zinc-900/95 border-2 border-zinc-700 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 pb-1 border-b border-zinc-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="font-mono font-bold text-emerald-400">
                L{activeLineIndex}
              </span>
              <span className="text-zinc-500">• Conta em digitação</span>
            </div>
            {editingTarget ? (
              <span className="text-amber-400 font-medium bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                ✏️ Editando Linha Retroativa
              </span>
            ) : (
              <span className="text-zinc-500 text-[10px]">
                Pressione AC para nova linha
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-h-[38px] font-mono text-base">
            {activeTokens.map((token) => {
              if (token.type === 'operator') {
                return (
                  <span
                    key={token.id}
                    className="text-amber-400 font-bold px-1 text-base select-none"
                  >
                    {token.value === '*' ? '×' : token.value === '/' ? '÷' : token.value}
                  </span>
                );
              }
              if (token.type === 'ref') {
                return (
                  <span
                    key={token.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-700/60 text-xs font-semibold"
                  >
                    <Link className="w-3 h-3 text-amber-400" />
                    <span>{token.value}</span>
                  </span>
                );
              }
              return (
                <span
                  key={token.id}
                  className="px-2 py-0.5 rounded-md bg-zinc-800 text-white border border-zinc-700 font-semibold text-sm"
                >
                  {token.value}
                </span>
              );
            })}

            {/* Currently Typing Number */}
            {activeNumberInput ? (
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-500 font-bold text-base shadow-sm">
                {activeNumberInput}
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-emerald-400 animate-pulse align-middle" />
              </span>
            ) : activeTokens.length === 0 ? (
              <span className="text-zinc-600 text-sm italic font-sans flex items-center">
                0
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-zinc-600 animate-pulse align-middle" />
              </span>
            ) : (
              <span className="inline-block w-1.5 h-4 bg-emerald-400 animate-pulse align-middle" />
            )}
          </div>

          {/* Active Line Live Preview Calculation */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 mt-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
              Prévia do cálculo
            </span>
            {activeDraftResult.error ? (
              <span className="text-xs text-red-400 font-mono font-medium">
                {activeDraftResult.error}
              </span>
            ) : activeDraftResult.result !== null ? (
              <span className="text-base text-zinc-300 font-mono font-bold flex items-center gap-1.5">
                <span className="text-zinc-500 font-sans text-xs">=</span>
                <span className="text-emerald-400">
                  {formatBrNumber(activeDraftResult.result)}
                </span>
              </span>
            ) : (
              <span className="text-xs text-zinc-600 font-mono">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
