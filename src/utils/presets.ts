/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Line } from './calcEngine';

export interface PresetScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  lines: Line[];
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'despesas',
    title: 'Divisão de Despesas da Casa',
    description: 'Soma contas do mês (Aluguel, Luz, Internet) e divide entre 3 pessoas com recálculo automático.',
    icon: 'home',
    lines: [
      {
        id: 'p1-l1',
        lineIndex: 1,
        tokens: [
          { id: 't-aluguel', type: 'number', value: '1800', label: 'Aluguel' },
          { id: 't-op1', type: 'operator', value: '+' },
          { id: 't-luz', type: 'number', value: '240', label: 'Energia/Luz' },
          { id: 't-op2', type: 'operator', value: '+' },
          { id: 't-net', type: 'number', value: '120', label: 'Internet Fibra' },
        ],
        result: 2160,
        error: null,
        isSealed: true,
        timestamp: Date.now() - 30000,
      },
      {
        id: 'p1-l2',
        lineIndex: 2,
        tokens: [
          { id: 't-ref1', type: 'ref', value: 'L1', refLineId: 'p1-l1', label: 'Total Contas' },
          { id: 't-op3', type: 'operator', value: '÷' },
          { id: 't-pessoas', type: 'number', value: '3', label: '3 Moradores' },
        ],
        result: 720,
        error: null,
        isSealed: true,
        timestamp: Date.now() - 20000,
      },
    ],
  },
  {
    id: 'reforma',
    title: 'Reforma & Metragem de Piso',
    description: 'Calcula área do cômodo, multiplica pelo valor do metro² e adiciona mão de obra.',
    icon: 'ruler',
    lines: [
      {
        id: 'p2-l1',
        lineIndex: 1,
        tokens: [
          { id: 't-larg', type: 'number', value: '4.5', label: 'Largura (m)' },
          { id: 't-op1', type: 'operator', value: '×' },
          { id: 't-comp', type: 'number', value: '6', label: 'Comprimento (m)' },
        ],
        result: 27,
        error: null,
        isSealed: true,
        timestamp: Date.now() - 40000,
      },
      {
        id: 'p2-l2',
        lineIndex: 2,
        tokens: [
          { id: 't-ref1', type: 'ref', value: 'L1', refLineId: 'p2-l1', label: 'Área Total m²' },
          { id: 't-op2', type: 'operator', value: '×' },
          { id: 't-preco', type: 'number', value: '75', label: 'Porcelanato R$/m²' },
        ],
        result: 2025,
        error: null,
        isSealed: true,
        timestamp: Date.now() - 25000,
      },
      {
        id: 'p2-l3',
        lineIndex: 3,
        tokens: [
          { id: 't-ref2', type: 'ref', value: 'L2', refLineId: 'p2-l2', label: 'Material' },
          { id: 't-op3', type: 'operator', value: '+' },
          { id: 't-mao', type: 'number', value: '950', label: 'Mão de Obra' },
        ],
        result: 2975,
        error: null,
        isSealed: true,
        timestamp: Date.now() - 10000,
      },
    ],
  },
  {
    id: 'desconto',
    title: 'Simulação "E se?": Desconto & Parcelas',
    description: 'Aplica desconto sobre um valor e calcula as parcelas em 3x sem juros.',
    icon: 'tag',
    lines: [
      {
        id: 'p3-l1',
        lineIndex: 1,
        tokens: [
          { id: 't-prod', type: 'number', value: '1500', label: 'Notebook' },
          { id: 't-op1', type: 'operator', value: '-' },
          { id: 't-desc', type: 'number', value: '225', label: 'Desc. 15%' },
        ],
        result: 1275,
        error: null,
        isSealed: true,
        timestamp: Date.now() - 15000,
      },
      {
        id: 'p3-l2',
        lineIndex: 2,
        tokens: [
          { id: 't-ref1', type: 'ref', value: 'L1', refLineId: 'p3-l1', label: 'Total à vista' },
          { id: 't-op2', type: 'operator', value: '÷' },
          { id: 't-parc', type: 'number', value: '3', label: '3x no cartão' },
        ],
        result: 425,
        error: null,
        isSealed: true,
        timestamp: Date.now() - 5000,
      },
    ],
  },
];
