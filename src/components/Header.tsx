/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Trash2, Volume2, VolumeX, Download, Layers, FileText } from 'lucide-react';

interface HeaderProps {
  totalLines: number;
  totalRefs: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenPresets: () => void;
  onOpenClearConfirm: () => void;
  onExport: () => void;
  onCopyTape: () => void;
  onOpenReceipt: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalLines,
  totalRefs,
  soundEnabled,
  onToggleSound,
  onOpenPresets,
  onOpenClearConfirm,
  onExport,
  onCopyTape,
  onOpenReceipt,
}) => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono shadow-sm shadow-emerald-500/10">
          ⚡
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-1">
              FluxCalc
            </h1>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              Reativa
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-none">
            {totalLines} {totalLines === 1 ? 'linha' : 'linhas'} • {totalRefs} {totalRefs === 1 ? 'vínculo' : 'vínculos em cascata'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={onOpenReceipt}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-950"
          title="Exportar Comprovante / Recibo em Texto para WhatsApp e Telegram"
          aria-label="Abrir comprovante em texto"
        >
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Comprovante</span>
        </button>

        <button
          onClick={onOpenPresets}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/50 rounded-lg transition-colors cursor-pointer"
          title="Exemplos Prontos (Despesas, Reforma, E Se?)"
          aria-label="Abrir exemplos de cálculos"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exemplos</span>
        </button>

        <button
          onClick={onCopyTape}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-zinc-300 bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 rounded-lg transition-colors cursor-pointer"
          title="Copiar texto da fita para a área de transferência"
          aria-label="Copiar fita"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Copiar Fita</span>
        </button>

        <button
          onClick={onExport}
          className="p-1.5 text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 rounded-lg transition-colors cursor-pointer"
          title="Exportar dados da sessão (JSON)"
          aria-label="Exportar sessão"
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleSound}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            soundEnabled
              ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60'
              : 'text-zinc-500 bg-zinc-800/60 border-zinc-700/40'
          }`}
          title={soundEnabled ? 'Som das teclas ativado' : 'Som desativado'}
          aria-label={soundEnabled ? 'Desativar som' : 'Ativar som'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {totalLines > 0 && (
          <button
            onClick={onOpenClearConfirm}
            className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-900/30 border border-red-900/40 rounded-lg transition-colors cursor-pointer"
            title="Limpar todo o histórico da fita"
            aria-label="Limpar histórico"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
