/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Upload, Copy, Check, X, FileText } from 'lucide-react';
import { Line, formatBrNumber } from '../utils/calcEngine';

interface ExportModalProps {
  isOpen: boolean;
  lines: Line[];
  onImport: (lines: Line[]) => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  lines,
  onImport,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const jsonExport = JSON.stringify(
    {
      app: 'FluxCalc',
      version: 1,
      exportedAt: new Date().toISOString(),
      lines,
    },
    null,
    2
  );

  const formattedTape = lines
    .map((l) => {
      const expr = l.tokens
        .map((t) => {
          if (t.type === 'operator') return ` ${t.value} `;
          const labelTag = t.label ? ` [${t.label}]` : '';
          return `${t.value}${labelTag}`;
        })
        .join('');
      const res = l.error ? `Erro: ${l.error}` : formatBrNumber(l.result);
      return `Linha ${l.lineIndex}: ${expr} = ${res}`;
    })
    .join('\n');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxcalc-fita-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importText);
      if (!parsed.lines || !Array.isArray(parsed.lines)) {
        throw new Error('Arquivo JSON não possui a propriedade "lines" válida.');
      }
      onImport(parsed.lines);
      onClose();
    } catch (e: unknown) {
      setImportError((e as Error).message || 'Formato JSON inválido');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-4 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar / Importar Dados da Fita</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section 1: Tape summary text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              Resumo em Texto da Fita:
            </span>
            <button
              onClick={() => handleCopy(formattedTape)}
              className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={formattedTape || '(Nenhum cálculo registrado ainda)'}
            rows={4}
            className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono text-xs focus:outline-none select-all"
          />
        </div>

        {/* Section 2: Download / Backup */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Salvar Backup Completo (JSON):
          </span>
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Baixar Arquivo JSON da Fita</span>
          </button>
        </div>

        {/* Section 3: Import JSON */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800">
          <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            Restaurar a partir de JSON:
          </span>
          <textarea
            placeholder="Cole o código JSON exportado aqui..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={3}
            className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono text-xs focus:outline-none focus:border-amber-500"
          />
          {importError && (
            <p className="text-xs text-red-400 font-medium">{importError}</p>
          )}
          <button
            onClick={handleImportSubmit}
            disabled={!importText.trim()}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
              importText.trim()
                ? 'bg-amber-600 hover:bg-amber-500 text-black cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Carregar e Restaurar Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
};
