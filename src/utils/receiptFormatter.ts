/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Line, Token } from './calcEngine';

export interface ReceiptOptions {
  includeCurrencySymbol?: boolean; // defaults to true (R$)
  includeTimestamp?: boolean;      // defaults to true
}

/**
 * Robust clipboard copy supporting both modern async Clipboard API
 * and fallback execCommand for iframes and headless environments.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }

  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (success) return true;
    } catch {
      // Fallback failed
    }
  }

  return false;
}

/**
 * Format a number to Brazilian currency or decimal representation.
 * e.g., 1250.5 -> "R$ 1.250,50" or "1.250,50"
 */
export function formatReceiptCurrency(
  val: number | null | undefined,
  includePrefix: boolean = true
): string {
  if (val === null || val === undefined) return 'N/A';
  if (isNaN(val)) return 'NaN';
  if (!isFinite(val)) return 'Infinito';

  // Format with 2 decimal places in Portuguese locale
  const fixed = Math.abs(val).toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = val < 0 ? '-' : '';
  const numString = `${sign}${formattedInt},${decPart}`;

  return includePrefix ? `R$ ${numString}` : numString;
}

function isQuantityLabel(label?: string): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  return (
    l.includes('pessoa') ||
    l.includes('morador') ||
    l.includes('amigo') ||
    l.includes('parcela') ||
    l.includes('vez') ||
    l.includes('unidade') ||
    l.includes('m²') ||
    l.includes('metro') ||
    l.includes('hora') ||
    l.includes('dia') ||
    l.includes('mes') ||
    l.includes('mês')
  );
}

/**
 * Formats a single calculation line into a clean receipt/voucher string.
 */
export function formatSingleLineReceipt(
  line: Line,
  lineLookup: Map<string, Line>,
  options: ReceiptOptions = {}
): string {
  const { includeCurrencySymbol = true, includeTimestamp = true } = options;
  const linesOut: string[] = [];

  linesOut.push('--- FluxCalc: Resumo do Cálculo ---');
  if (includeTimestamp) {
    const timeStr = new Date(line.timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    linesOut.push(`Data: ${timeStr} | Linha L${line.lineIndex}`);
  }
  linesOut.push('-----------------------------------');

  let itemIndex = 1;
  const opTokens: string[] = [];
  let divisorPessoas = '';

  for (let i = 0; i < line.tokens.length; i++) {
    const token = line.tokens[i];

    if (token.type === 'number') {
      const numVal = parseFloat(token.value.replace(',', '.'));
      const isQty = isQuantityLabel(token.label);
      const valFormatted = isNaN(numVal)
        ? token.value
        : isQty
        ? token.value
        : formatReceiptCurrency(numVal, includeCurrencySymbol);

      const labelPart = token.label ? ` (${token.label})` : '';
      linesOut.push(`Item ${itemIndex}${labelPart}: ${valFormatted}`);
      opTokens.push(token.value);

      // Check if preceding operator was division and has label like "pessoas" or "moradores"
      if (i > 0 && (line.tokens[i - 1].value === '/' || line.tokens[i - 1].value === '÷')) {
        const pLabel = token.label ? token.label.toLowerCase() : '';
        if (
          pLabel.includes('pessoa') ||
          pLabel.includes('morador') ||
          pLabel.includes('amigo') ||
          pLabel.includes('parcela') ||
          pLabel.includes('parte')
        ) {
          const countDesc = token.label
            ? token.label.startsWith(token.value)
              ? token.label
              : `${token.value} ${token.label}`
            : `${token.value} pessoas`;
          const unit = pLabel.includes('parcela') ? '/parcela' : '/pessoa';
          divisorPessoas = ` (÷ ${countDesc} = ${formatReceiptCurrency(line.result, includeCurrencySymbol)}${unit})`;
        }
      }

      itemIndex++;
    } else if (token.type === 'ref') {
      const refLine = token.refLineId ? lineLookup.get(token.refLineId) : undefined;
      const refName = refLine ? `L${refLine.lineIndex}` : 'L?';
      const labelPart = token.label
        ? ` (${token.label})`
        : refLine
        ? ` (Origem ${refName})`
        : '';
      const refVal = refLine?.result ?? null;
      const valFormatted = formatReceiptCurrency(refVal, includeCurrencySymbol);

      linesOut.push(`Item ${itemIndex}${labelPart}: ${valFormatted}`);
      opTokens.push(refName);
      itemIndex++;
    } else if (token.type === 'operator') {
      const symbol =
        token.value === '*' ? '×' : token.value === '/' ? '÷' : token.value === '-' ? '−' : token.value;
      opTokens.push(symbol);
    }
  }

  linesOut.push('-----------------------------------');
  linesOut.push(`Operação: ${opTokens.join(' ')}`);

  if (line.error) {
    linesOut.push(`Resultado: ${line.error}`);
  } else {
    const totalFormatted = formatReceiptCurrency(line.result, includeCurrencySymbol);
    linesOut.push(`Total: ${totalFormatted}${divisorPessoas}`);
  }

  linesOut.push('-----------------------------------');
  linesOut.push('Gerado via FluxCalc');

  return linesOut.join('\n');
}

/**
 * Formats the entire tape of calculations into an organized receipt document.
 */
export function formatFullTapeReceipt(
  lines: Line[],
  lineLookup: Map<string, Line>,
  options: ReceiptOptions = {}
): string {
  const { includeCurrencySymbol = true, includeTimestamp = true } = options;

  if (lines.length === 0) {
    return '--- FluxCalc: Fita Vazia ---\nNenhum cálculo registrado ainda.\n----------------------------';
  }

  const out: string[] = [];
  out.push('===================================');
  out.push('    FLUXCALC: COMPROVANTE DA FITA  ');
  out.push('===================================');

  if (includeTimestamp) {
    const timeStr = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    out.push(`Data de Emissão: ${timeStr}`);
    out.push(`Total de Linhas: ${lines.length}`);
    out.push('-----------------------------------');
  }

  for (const line of lines) {
    out.push(`\n[ LINHA L${line.lineIndex} ]`);

    let itemIndex = 1;
    const opTokens: string[] = [];

    for (const token of line.tokens) {
      if (token.type === 'number') {
        const numVal = parseFloat(token.value.replace(',', '.'));
        const isQty = isQuantityLabel(token.label);
        const valFormatted = isNaN(numVal)
          ? token.value
          : isQty
          ? token.value
          : formatReceiptCurrency(numVal, includeCurrencySymbol);
        const labelPart = token.label ? ` (${token.label})` : '';
        out.push(`  Item ${itemIndex}${labelPart}: ${valFormatted}`);
        opTokens.push(token.value);
        itemIndex++;
      } else if (token.type === 'ref') {
        const refLine = token.refLineId ? lineLookup.get(token.refLineId) : undefined;
        const refName = refLine ? `L${refLine.lineIndex}` : 'L?';
        const labelPart = token.label
          ? ` (${token.label})`
          : refLine
          ? ` (de ${refName})`
          : '';
        const refVal = refLine?.result ?? null;
        const valFormatted = formatReceiptCurrency(refVal, includeCurrencySymbol);
        out.push(`  Item ${itemIndex}${labelPart}: ${valFormatted}`);
        opTokens.push(refName);
        itemIndex++;
      } else if (token.type === 'operator') {
        const symbol =
          token.value === '*' ? '×' : token.value === '/' ? '÷' : token.value === '-' ? '−' : token.value;
        opTokens.push(symbol);
      }
    }

    out.push(`  Operação: ${opTokens.join(' ')}`);

    if (line.error) {
      out.push(`  Resultado: ${line.error}`);
    } else {
      out.push(`  Subtotal L${line.lineIndex}: ${formatReceiptCurrency(line.result, includeCurrencySymbol)}`);
    }
  }

  out.push('\n===================================');

  // Highlight final result of the tape if available
  const lastLine = lines[lines.length - 1];
  if (lastLine.result !== null && !lastLine.error) {
    out.push(`TOTAL FINAL: ${formatReceiptCurrency(lastLine.result, includeCurrencySymbol)}`);
    out.push('===================================');
  }

  out.push('Gerado via FluxCalc (Calculadora Reativa)');

  return out.join('\n');
}
