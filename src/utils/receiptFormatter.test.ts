import test from 'node:test';
import assert from 'node:assert/strict';
import { Line } from './calcEngine';
import {
  formatReceiptCurrency,
  formatSingleLineReceipt,
  formatFullTapeReceipt,
} from './receiptFormatter';

test('formatReceiptCurrency formats correctly with R$ prefix and Brazilian decimals', () => {
  assert.equal(formatReceiptCurrency(120), 'R$ 120,00');
  assert.equal(formatReceiptCurrency(1250.75), 'R$ 1.250,75');
  assert.equal(formatReceiptCurrency(80, false), '80,00');
  assert.equal(formatReceiptCurrency(null), 'N/A');
});

test('formatSingleLineReceipt formats tokens, labels, and operations', () => {
  const line: Line = {
    id: 'l1',
    lineIndex: 1,
    tokens: [
      { id: 't1', type: 'number', value: '120', label: 'Luz' },
      { id: 't2', type: 'operator', value: '+' },
      { id: 't3', type: 'number', value: '80', label: 'Internet' },
      { id: 't4', type: 'operator', value: '+' },
      { id: 't5', type: 'number', value: '250', label: 'Mercado' },
    ],
    result: 450,
    error: null,
    isSealed: true,
    timestamp: 1700000000000,
  };

  const lookup = new Map<string, Line>([['l1', line]]);
  const receipt = formatSingleLineReceipt(line, lookup, { includeTimestamp: false });

  assert.ok(receipt.includes('--- FluxCalc: Resumo do Cálculo ---'));
  assert.ok(receipt.includes('Item 1 (Luz): R$ 120,00'));
  assert.ok(receipt.includes('Item 2 (Internet): R$ 80,00'));
  assert.ok(receipt.includes('Item 3 (Mercado): R$ 250,00'));
  assert.ok(receipt.includes('Operação: 120 + 80 + 250'));
  assert.ok(receipt.includes('Total: R$ 450,00'));
  assert.ok(receipt.includes('Gerado via FluxCalc'));
});

test('formatFullTapeReceipt handles cascading references and final total', () => {
  const line1: Line = {
    id: 'l1',
    lineIndex: 1,
    tokens: [
      { id: 't1', type: 'number', value: '1800', label: 'Aluguel' },
      { id: 't2', type: 'operator', value: '+' },
      { id: 't3', type: 'number', value: '300', label: 'Contas' },
    ],
    result: 2100,
    error: null,
    isSealed: true,
    timestamp: 1700000000000,
  };

  const line2: Line = {
    id: 'l2',
    lineIndex: 2,
    tokens: [
      { id: 't4', type: 'ref', value: 'L1', refLineId: 'l1', label: 'Total Moradia' },
      { id: 't5', type: 'operator', value: '÷' },
      { id: 't6', type: 'number', value: '3', label: '3 pessoas' },
    ],
    result: 700,
    error: null,
    isSealed: true,
    timestamp: 1700000010000,
  };

  const lookup = new Map<string, Line>([
    ['l1', line1],
    ['l2', line2],
  ]);

  const receipt = formatFullTapeReceipt([line1, line2], lookup, { includeTimestamp: false });

  assert.ok(receipt.includes('FLUXCALC: COMPROVANTE DA FITA'));
  assert.ok(receipt.includes('[ LINHA L1 ]'));
  assert.ok(receipt.includes('Item 1 (Aluguel): R$ 1.800,00'));
  assert.ok(receipt.includes('[ LINHA L2 ]'));
  assert.ok(receipt.includes('Item 1 (Total Moradia): R$ 2.100,00'));
  assert.ok(receipt.includes('TOTAL FINAL: R$ 700,00'));
});
