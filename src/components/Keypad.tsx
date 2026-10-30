/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Delete, CornerDownLeft, Plus, Minus, X, Divide, Percent, Tag } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: string) => void;
  onDecimal: () => void;
  onClearOne: () => void;      // Key C
  onAllClear: () => void;      // Key AC (seals current line, scrolls up tape, starts fresh line)
  onEquals: () => void;        // Key =
  onToggleSign: () => void;    // ±
  onPercent: () => void;       // %
  onQuickNote: () => void;     // Add note to active number
  onReuseLastResult: () => void; // Shortcut to reuse last line's result
  hasLastResult: boolean;
  isEditingRetroactive: boolean;
  onCancelRetroactive: () => void;
  onConfirmRetroactive: () => void;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onDecimal,
  onClearOne,
  onAllClear,
  onEquals,
  onToggleSign,
  onPercent,
  onQuickNote,
  onReuseLastResult,
  hasLastResult,
  isEditingRetroactive,
  onCancelRetroactive,
  onConfirmRetroactive,
}) => {
  return (
    <div
      className="h-[52%] bg-zinc-900 border-t border-zinc-800 p-2 sm:p-3 flex flex-col justify-between shrink-0 select-none max-w-2xl mx-auto w-full"
      style={{ minHeight: '50%' }}
    >
      {/* Top Utility Ribbon */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5 px-0.5">
        {isEditingRetroactive ? (
          <div className="w-full flex items-center justify-between bg-amber-950/60 border border-amber-600/70 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-amber-300 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Editando número
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onQuickNote}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-medium rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
                title="Adicionar ou editar etiqueta deste número"
              >
                <Tag className="w-3 h-3 text-emerald-400" />
                <span>Nota</span>
              </button>
              <button
                onClick={onConfirmRetroactive}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Concluir
              </button>
              <button
                onClick={onCancelRetroactive}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between text-xs gap-1.5">
            <button
              onClick={onReuseLastResult}
              disabled={!hasLastResult}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[11px] sm:text-xs font-medium transition-colors cursor-pointer ${
                hasLastResult
                  ? 'bg-zinc-800/90 hover:bg-zinc-700 text-emerald-400 border-emerald-900/50 hover:border-emerald-700'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800/80 cursor-not-allowed'
              }`}
              title="Injetar resultado do cálculo anterior como operando"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Reutilizar Último Resultado</span>
            </button>

            <button
              onClick={onQuickNote}
              className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg border bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/60 text-[11px] sm:text-xs font-medium transition-colors cursor-pointer"
              title="Adicionar uma etiqueta de texto (máx 25 caracteres)"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Etiqueta</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: 5 Rows x 4 Columns */}
      <div className="grid grid-cols-4 grid-rows-5 gap-1.5 sm:gap-2 flex-1">
        {/* Row 1: AC, C, %, ÷ */}
        <button
          onClick={onAllClear}
          className="rounded-xl font-bold text-sm sm:text-base bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/60 active:scale-95 transition-all shadow-sm cursor-pointer flex flex-col items-center justify-center"
          title="AC: Sela a conta atual, move a fita para cima e abre uma nova linha zerada (preserva o histórico)"
          aria-label="AC - Nova linha"
        >
          <span className="text-base sm:text-lg">AC</span>
          <span className="text-[9px] font-sans font-normal text-amber-400/70 -mt-0.5">Nova Linha</span>
        </button>

        <button
          onClick={onClearOne}
          className="rounded-xl font-bold text-base sm:text-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 active:scale-95 transition-all shadow-sm cursor-pointer flex flex-col items-center justify-center"
          title="C: Apaga o último dígito ou token inserido na conta ativa"
          aria-label="C - Apagar último dígito"
        >
          <div className="flex items-center gap-1">
            <Delete className="w-4 h-4 text-zinc-400" />
            <span>C</span>
          </div>
          <span className="text-[9px] font-sans font-normal text-zinc-400 -mt-0.5">Apagar</span>
        </button>

        <button
          onClick={onPercent}
          className="rounded-xl font-bold text-lg sm:text-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/80 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          title="Porcentagem (%)"
          aria-label="Porcentagem"
        >
          <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />
        </button>

        <button
          onClick={() => onOperator('÷')}
          className="rounded-xl font-bold text-xl sm:text-2xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          title="Divisão (÷)"
          aria-label="Dividir"
        >
          <Divide className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Row 2: 7, 8, 9, × */}
        <button
          onClick={() => onDigit('7')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="7"
        >
          7
        </button>
        <button
          onClick={() => onDigit('8')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="8"
        >
          8
        </button>
        <button
          onClick={() => onDigit('9')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="9"
        >
          9
        </button>
        <button
          onClick={() => onOperator('×')}
          className="rounded-xl font-bold text-xl sm:text-2xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          title="Multiplicação (×)"
          aria-label="Multiplicar"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Row 3: 4, 5, 6, − */}
        <button
          onClick={() => onDigit('4')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="4"
        >
          4
        </button>
        <button
          onClick={() => onDigit('5')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="5"
        >
          5
        </button>
        <button
          onClick={() => onDigit('6')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="6"
        >
          6
        </button>
        <button
          onClick={() => onOperator('−')}
          className="rounded-xl font-bold text-xl sm:text-2xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          title="Subtração (−)"
          aria-label="Subtrair"
        >
          <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Row 4: 1, 2, 3, + */}
        <button
          onClick={() => onDigit('1')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="1"
        >
          1
        </button>
        <button
          onClick={() => onDigit('2')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="2"
        >
          2
        </button>
        <button
          onClick={() => onDigit('3')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="3"
        >
          3
        </button>
        <button
          onClick={() => onOperator('+')}
          className="rounded-xl font-bold text-xl sm:text-2xl bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          title="Adição (+)"
          aria-label="Somar"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Row 5: ±, 0, , (vírgula decimal), = */}
        <button
          onClick={onToggleSign}
          className="rounded-xl font-bold text-lg sm:text-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center font-mono"
          title="Inverter sinal (±)"
          aria-label="Inverter sinal"
        >
          ±
        </button>

        <button
          onClick={() => onDigit('0')}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          aria-label="0"
        >
          0
        </button>

        <button
          onClick={onDecimal}
          className="rounded-xl font-mono font-bold text-xl sm:text-2xl bg-zinc-800/90 hover:bg-zinc-700 text-white border border-zinc-700/60 active:scale-95 transition-all shadow-sm cursor-pointer flex items-center justify-center"
          title="Ponto / Vírgula Decimal (,)"
          aria-label="Vírgula decimal"
        >
          ,
        </button>

        <button
          onClick={onEquals}
          className="rounded-xl font-bold text-2xl sm:text-3xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95 transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center"
          title="Calcular e Selar Linha na Fita (=)"
          aria-label="Calcular igual"
        >
          =
        </button>
      </div>
    </div>
  );
};
