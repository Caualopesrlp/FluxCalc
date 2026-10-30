/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Tag, X, Check, Trash2 } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  tokenValue: string;
  initialLabel: string;
  onSave: (label: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  tokenValue,
  initialLabel,
  onSave,
  onRemove,
  onClose,
}) => {
  const [label, setLabel] = useState(initialLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const charCount = label.length;
  const maxChars = 25;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-4 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Tag className="w-4 h-4 text-emerald-400" />
            <span>Etiqueta para o valor: <span className="font-mono text-emerald-300">{tokenValue}</span></span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">
            Texto da Nota (máx. 25 caracteres):
          </label>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              maxLength={maxChars}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSave(label);
                if (e.key === 'Escape') onClose();
              }}
              placeholder="Ex: Aluguel, Almoço, Metros²"
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <span
              className={`absolute right-3 top-2.5 text-[11px] font-mono ${
                charCount >= maxChars ? 'text-amber-400 font-bold' : 'text-zinc-500'
              }`}
            >
              {charCount}/{maxChars}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">
            Ajuda a identificar o que cada número representa no cálculo e na fita.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          {initialLabel ? (
            <button
              onClick={onRemove}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(label)}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
