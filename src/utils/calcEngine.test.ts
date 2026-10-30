import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Token,
  Line,
  evaluateTokens,
  recalculateAll,
  updateTokenValue,
  updateTokenLabel,
  formatBrNumber
} from './calcEngine';

test('formatBrNumber formats properly with comma decimals and period thousands', () => {
  assert.equal(formatBrNumber(1250.5), '1.250,5');
  assert.equal(formatBrNumber(100), '100');
  assert.equal(formatBrNumber(0), '0');
  assert.equal(formatBrNumber(null), '');
});

test('evaluateTokens handles basic arithmetic and precedence', () => {
  const lineMap = new Map<string, Line>();
  const tokens: Token[] = [
    { id: '1', type: 'number', value: '20' },
    { id: '2', type: 'operator', value: '+' },
    { id: '3', type: 'number', value: '5' },
    { id: '4', type: 'operator', value: '×' },
    { id: '5', type: 'number', value: '4' }
  ];

  // 20 + (5 * 4) = 40
  const { result, error } = evaluateTokens(tokens, lineMap);
  assert.equal(error, null);
  assert.equal(result, 40);
});

test('evaluateTokens catches division by zero without throwing', () => {
  const lineMap = new Map<string, Line>();
  const tokens: Token[] = [
    { id: '1', type: 'number', value: '100' },
    { id: '2', type: 'operator', value: '÷' },
    { id: '3', type: 'number', value: '0' }
  ];

  const { result, error } = evaluateTokens(tokens, lineMap);
  assert.equal(result, null);
  assert.equal(error, 'Erro: Divisão por 0');
});

test('recalculateAll propagates cascade changes across dependent lines', () => {
  const line1: Line = {
    id: 'line-1',
    lineIndex: 1,
    tokens: [
      { id: 't1', type: 'number', value: '50' },
      { id: 't2', type: 'operator', value: '+' },
      { id: 't3', type: 'number', value: '25' }
    ],
    result: 75,
    error: null,
    isSealed: true,
    timestamp: 1
  };

  const line2: Line = {
    id: 'line-2',
    lineIndex: 2,
    tokens: [
      { id: 't4', type: 'ref', value: 'L1', refLineId: 'line-1' },
      { id: 't5', type: 'operator', value: '×' },
      { id: 't6', type: 'number', value: '2' }
    ],
    result: 150,
    error: null,
    isSealed: true,
    timestamp: 2
  };

  // Line 3 depends on Line 2
  const line3: Line = {
    id: 'line-3',
    lineIndex: 3,
    tokens: [
      { id: 't7', type: 'ref', value: 'L2', refLineId: 'line-2' },
      { id: 't8', type: 'operator', value: '-' },
      { id: 't9', type: 'number', value: '10' }
    ],
    result: 140,
    error: null,
    isSealed: true,
    timestamp: 3
  };

  // Retroactive edit on Line 1: change 50 to 100
  // Line 1 becomes 100 + 25 = 125
  // Line 2 becomes 125 * 2 = 250
  // Line 3 becomes 250 - 10 = 240
  const { lines, affectedLineIds } = updateTokenValue([line1, line2, line3], 'line-1', 't1', '100');

  assert.equal(lines[0].result, 125);
  assert.equal(lines[1].result, 250);
  assert.equal(lines[2].result, 240);
  assert.ok(affectedLineIds.has('line-1'));
  assert.ok(affectedLineIds.has('line-2'));
  assert.ok(affectedLineIds.has('line-3'));
});

test('updateTokenLabel enforces max 25 characters', () => {
  const line: Line = {
    id: 'line-1',
    lineIndex: 1,
    tokens: [{ id: 't1', type: 'number', value: '50' }],
    result: 50,
    error: null,
    isSealed: true,
    timestamp: 1
  };

  const updated = updateTokenLabel([line], 'line-1', 't1', 'Supermercado Mensal com Desconto Extra');
  assert.equal(updated[0].tokens[0].label?.length, 25);
  assert.equal(updated[0].tokens[0].label, 'Supermercado Mensal com D');
});
