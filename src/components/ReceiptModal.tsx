/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { FileText, Copy, Check, X, Share2, DollarSign, Layers, Calendar } from 'lucide-react';
import { Line } from '../utils/calcEngine';
import {
  formatSingleLineReceipt,
  formatFullTapeReceipt,
  copyToClipboard,
} from '../utils/receiptFormatter';

interface ReceiptModalProps {
  isOpen: boolean;
  lines: Line[];
  activeTokensLine: Line | null;
  selectedLineId: string | null;
  lineLookup: Map<string, Line>;
  onClose: () => void;
  onCopySuccess: (message: string) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  lines,
  activeTokensLine,
  selectedLineId,
  lineLookup,
  onClose,
  onCopySuccess,
}) => {
  // Mode: 'single' (specific or active line) or 'full' (entire tape)
  const [exportMode, setExportMode] = useState<'single' | 'full'>('single');
  const [includeCurrency, setIncludeCurrency] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [copied, setCopied] = useState(false);

  // Determine which single line to display
  const targetLine = useMemo(() => {
    if (selectedLineId) {
      const found = lineLookup.get(selectedLineId);
      if (found) return found;
    }
    // Fallback: active drafting line if it has tokens, or last completed line
    if (activeTokensLine && activeTokensLine.tokens.length > 0) {
      return activeTokensLine;
    }
    if (lines.length > 0) {
      return lines[lines.length - 1];
    }
    return null;
  }, [selectedLineId, lineLookup, activeTokensLine, lines]);

  // Generate the formatted receipt text
  const formattedReceiptText = useMemo(() => {
    const opts = {
      includeCurrencySymbol: includeCurrency,
      includeTimestamp: includeTimestamp,
    };

    if (exportMode === 'single') {
      if (!targetLine) {
        return '--- FluxCalc: Nenhuma conta para exibir ---';
      }
      return formatSingleLineReceipt(targetLine, lineLookup, opts);
    } else {
      return formatFullTapeReceipt(lines, lineLookup, opts);
    }
  }, [exportMode, targetLine, lines, lineLookup, includeCurrency, includeTimestamp]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const success = await copyToClipboard(formattedReceiptText);
    if (success) {
      setCopied(true);
      onCopySuccess('Comprovante copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2500);
    } else {
      onCopySuccess('Texto selecionado. Use Ctrl+C para copiar.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Comprovante de Cálculo - FluxCalc',
          text: formattedReceiptText,
        });
        onCopySuccess('Comprovante compartilhado com sucesso!');
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                Exportar Comprovante em Texto
              </h2>
              <p className="text-[11px] text-zinc-400">
                Formato recibo limpo, pronto para enviar no WhatsApp ou Telegram
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Fechar comprovante"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls / Options Bar */}
        <div className="px-4 py-2.5 bg-zinc-950/80 border-b border-zinc-800 space-y-2.5 shrink-0 text-xs">
          {/* Radio Tabs: Single Line vs Full Tape */}
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
            <button
              onClick={() => setExportMode('single')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                exportMode === 'single'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {targetLine ? `Linha L${targetLine.lineIndex}` : 'Conta Atual'}
              </span>
            </button>
            <button
              onClick={() => setExportMode('full')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                exportMode === 'full'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Fita Completa ({lines.length} {lines.length === 1 ? 'linha' : 'linhas'})</span>
            </button>
          </div>

          {/* Format Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-zinc-300 text-[11px]">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={includeCurrency}
                onChange={(e) => setIncludeCurrency(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <DollarSign className="w-3 h-3 text-emerald-400 -mr-0.5" />
              <span>Incluir R$</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <Calendar className="w-3 h-3 text-zinc-400 -mr-0.5" />
              <span>Data e Hora</span>
            </label>
          </div>
        </div>

        {/* Styled Receipt Paper Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 font-mono">
          <div className="relative bg-zinc-900/90 rounded-xl border border-zinc-800 p-3.5 text-zinc-200 text-xs leading-relaxed shadow-inner">
            <div className="absolute top-2 right-2 text-[10px] uppercase font-sans font-semibold tracking-wider text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Prévia do Comprovante
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[11px] sm:text-xs text-zinc-300 select-all">
              {formattedReceiptText}
            </pre>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex items-center gap-2">
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl transition-colors cursor-pointer"
                title="Compartilhar via aplicativo"
              >
                <Share2 className="w-3.5 h-3.5 text-zinc-300" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            )}

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/25 active:scale-95'
              }`}
              title="Copiar texto formatado para a área de transferência"
              aria-label="Copiar comprovante"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Comprovante</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
