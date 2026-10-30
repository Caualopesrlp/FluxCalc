/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Home, Ruler, Tag, X, ChevronRight } from 'lucide-react';
import { PRESET_SCENARIOS, PresetScenario } from '../utils/presets';

interface PresetSelectorModalProps {
  isOpen: boolean;
  onSelect: (scenario: PresetScenario) => void;
  onClose: () => void;
}

export const PresetSelectorModal: React.FC<PresetSelectorModalProps> = ({
  isOpen,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'home':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'ruler':
        return <Ruler className="w-4 h-4 text-amber-400" />;
      case 'tag':
        return <Tag className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Exemplos Prontos para Simulação</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Escolha um cenário comum do dia a dia para carregar contas interligadas e testar a edição retroativa em cascata:
        </p>

        <div className="space-y-2">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                onSelect(preset);
                onClose();
              }}
              className="w-full text-left p-3 rounded-xl bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/60 hover:border-emerald-500/60 transition-all flex items-start gap-3 group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/80 shrink-0 mt-0.5">
                {getIcon(preset.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                    {preset.title}
                  </h3>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-1 text-center">
          <span className="text-[11px] text-zinc-500">
            Carregar um exemplo substitui a fita atual pela simulação selecionada.
          </span>
        </div>
      </div>
    </div>
  );
};
