/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ClearConfirmModalProps {
  isOpen: boolean;
  totalLines: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  totalLines,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Limpar Histórico Completo</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          Tem certeza de que deseja apagar todas as <span className="font-bold text-white">{totalLines} contas</span> salvas na fita?
          <br /><br />
          <span className="text-zinc-400">
            Nota: A tecla <span className="text-amber-400 font-bold">AC</span> apenas fecha a conta atual e abre uma nova linha, mantendo o histórico. Esta opção apaga a memória inteira.
          </span>
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer shadow-sm shadow-red-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Sim, Apagar Tudo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
