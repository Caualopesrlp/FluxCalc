/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Token {
  id: string;
  type: 'number' | 'operator' | 'ref';
  value: string;
  refLineId?: string;
  label?: string;
}

export interface Line {
  id: string;
  lineIndex: number;
  tokens: Token[];
  result: number | null;
  error: string | null;
  isSealed: boolean;
  timestamp: number;
  justRecalculated?: boolean;
}

export interface AppState {
  lines: Line[];
  activeLineIndex: number;
  activeTokens: Token[];
  activeNumberInput: string;
  editingTarget: { lineId: string; tokenId: string } | null;
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36).substring(4);
}

/**
 * Format a number using Brazilian Portuguese locale (e.g., 1.234,56).
 */
export function formatBrNumber(val: number | null | undefined): string {
  if (val === null || val === undefined) return '';
  if (isNaN(val)) return 'NaN';
  if (!isFinite(val)) return 'Infinito';

  // Format with up to 6 decimal places, omitting trailing zeros
  const parts = val.toString().split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (parts.length > 1) {
    // Trim very long floats if necessary
    const decimals = parts[1].substring(0, 6);
    return `${integerPart},${decimals}`;
  }
  return integerPart;
}

/**
 * Evaluates a sequence of tokens in the context of line lookups.
 * Follows standard arithmetic precedence (* and / before + and -).
 */
export function evaluateTokens(
  tokens: Token[],
  lineLookup: Map<string, Line>
): { result: number | null; error: string | null } {
  if (tokens.length === 0) {
    return { result: null, error: null };
  }

  // Resolve values
  const resolved: { type: 'number' | 'operator'; value: string }[] = [];

  for (const token of tokens) {
    if (token.type === 'ref') {
      if (!token.refLineId || !lineLookup.has(token.refLineId)) {
        return { result: null, error: 'Referência não encontrada' };
      }
      const refLine = lineLookup.get(token.refLineId)!;
      if (refLine.error) {
        return { result: null, error: `Depende de erro em L${refLine.lineIndex}` };
      }
      if (refLine.result === null) {
        return { result: null, error: `L${refLine.lineIndex} sem resultado` };
      }
      resolved.push({ type: 'number', value: refLine.result.toString() });
    } else if (token.type === 'number') {
      resolved.push({ type: 'number', value: token.value });
    } else if (token.type === 'operator') {
      resolved.push({ type: 'operator', value: token.value });
    }
  }

  // If last item is operator, ignore for preview calculation
  const clean = [...resolved];
  if (clean.length > 0 && clean[clean.length - 1].type === 'operator') {
    clean.pop();
  }

  if (clean.length === 0) {
    return { result: null, error: null };
  }

  // Extract numbers and operators
  const numbers: number[] = [];
  const operators: string[] = [];

  let expectNumber = true;
  for (const item of clean) {
    if (expectNumber) {
      if (item.type === 'number') {
        const num = parseFloat(item.value.replace(',', '.'));
        if (isNaN(num)) {
          return { result: null, error: `Valor inválido: ${item.value}` };
        }
        numbers.push(num);
        expectNumber = false;
      } else {
        return { result: null, error: 'Sintaxe incompleta' };
      }
    } else {
      if (item.type === 'operator') {
        operators.push(item.value);
        expectNumber = true;
      } else {
        return { result: null, error: 'Operador ausente entre números' };
      }
    }
  }

  if (numbers.length === 0) {
    return { result: null, error: null };
  }

  if (numbers.length !== operators.length + 1) {
    return { result: null, error: 'Sintaxe incompleta' };
  }

  // Step 1: Precedence (* and /)
  let i = 0;
  while (i < operators.length) {
    const op = operators[i];
    if (op === '*' || op === '×') {
      numbers[i] = numbers[i] * numbers[i + 1];
      numbers.splice(i + 1, 1);
      operators.splice(i, 1);
    } else if (op === '/' || op === '÷') {
      const divisor = numbers[i + 1];
      if (divisor === 0) {
        return { result: null, error: 'Erro: Divisão por 0' };
      }
      numbers[i] = numbers[i] / divisor;
      numbers.splice(i + 1, 1);
      operators.splice(i, 1);
    } else {
      i++;
    }
  }

  // Step 2: Precedence (+ and -)
  let result = numbers[0];
  for (let j = 0; j < operators.length; j++) {
    const op = operators[j];
    const nextNum = numbers[j + 1];
    if (op === '+') {
      result += nextNum;
    } else if (op === '-' || op === '−') {
      result -= nextNum;
    } else {
      return { result: null, error: `Operador não suportado: ${op}` };
    }
  }

  // Clean precision issues (e.g. 0.1 + 0.2)
  const precisionResult = parseFloat(result.toFixed(10));
  return { result: precisionResult, error: null };
}

/**
 * Builds dependency relationships and recalculates all dependent lines.
 */
export function recalculateAll(lines: Line[]): {
  lines: Line[];
  affectedLineIds: Set<string>;
} {
  const lineMap = new Map<string, Line>();
  lines.forEach((l) => lineMap.set(l.id, { ...l, tokens: l.tokens.map((t) => ({ ...t })) }));

  // Dependency mapping
  const dependents = new Map<string, Set<string>>();
  for (const line of lines) {
    for (const token of line.tokens) {
      if (token.type === 'ref' && token.refLineId) {
        if (!dependents.has(token.refLineId)) {
          dependents.set(token.refLineId, new Set());
        }
        dependents.get(token.refLineId)!.add(line.id);
      }
    }
  }

  // Sort lines by lineIndex to evaluate in proper topological order
  const sortedLines = Array.from(lineMap.values()).sort((a, b) => a.lineIndex - b.lineIndex);
  const affectedLineIds = new Set<string>();

  for (const line of sortedLines) {
    const oldResult = line.result;
    const oldError = line.error;
    const { result, error } = evaluateTokens(line.tokens, lineMap);
    line.result = result;
    line.error = error;

    if (oldResult !== result || oldError !== error) {
      affectedLineIds.add(line.id);
      line.justRecalculated = true;
    }
  }

  return {
    lines: sortedLines,
    affectedLineIds,
  };
}

/**
 * Updates a token retroactively in a sealed line and recalculates downstream cascade.
 */
export function updateTokenValue(
  lines: Line[],
  lineId: string,
  tokenId: string,
  newValue: string
): { lines: Line[]; affectedLineIds: Set<string> } {
  const updatedLines = lines.map((l) => {
    if (l.id !== lineId) return l;
    return {
      ...l,
      tokens: l.tokens.map((t) => (t.id === tokenId ? { ...t, value: newValue } : t)),
    };
  });

  return recalculateAll(updatedLines);
}

/**
 * Updates a token's quick note/label.
 */
export function updateTokenLabel(
  lines: Line[],
  lineId: string,
  tokenId: string,
  label: string
): Line[] {
  const cleanLabel = label.trim().substring(0, 25);
  return lines.map((l) => {
    if (l.id !== lineId) return l;
    return {
      ...l,
      tokens: l.tokens.map((t) =>
        t.id === tokenId ? { ...t, label: cleanLabel || undefined } : t
      ),
    };
  });
}
