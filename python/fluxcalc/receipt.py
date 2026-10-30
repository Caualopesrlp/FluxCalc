"""FluxCalc - Formatter for Clean Receipts/Vouchers (Comprovante em Texto)."""
from typing import List, Dict, Optional
from .models import Line, Token

def format_currency_br(val: Optional[float], prefix_r_dollar: bool = True) -> str:
    if val is None:
        return "N/A"
    parts = f"{val:.2f}".split(".")
    integer_part = parts[0]
    decimal_part = parts[1]
    
    # Format thousands with dot
    rev = integer_part[::-1]
    chunks = [rev[i:i+3] for i in range(0, len(rev), 3)]
    formatted_int = ".".join(chunks)[::-1]
    
    formatted = f"{formatted_int},{decimal_part}"
    if prefix_r_dollar:
        return f"R$ {formatted}"
    return formatted

def format_line_receipt(line: Line, line_lookup: Dict[str, Line], prefix_r_dollar: bool = True) -> str:
    """
    Formats a single line calculation into a clean receipt style.
    """
    lines_out = []
    lines_out.append(f"--- FluxCalc: Linha {line.line_index} ---")
    
    item_idx = 1
    op_tokens = []
    for token in line.tokens:
        if token.type == "number":
            label_part = f" ({token.label})" if token.label else ""
            try:
                num_val = float(token.value)
                val_str = format_currency_br(num_val, prefix_r_dollar)
            except ValueError:
                val_str = token.value
            lines_out.append(f"Item {item_idx}{label_part}: {val_str}")
            op_tokens.append(token.value)
            item_idx += 1
        elif token.type == "ref":
            ref_l = line_lookup.get(token.ref_line_id or "")
            ref_name = f"L{ref_l.line_index}" if ref_l else "L?"
            label_part = f" ({token.label or f'Total de {ref_name}'})"
            res_val = ref_l.result if ref_l else None
            val_str = format_currency_br(res_val, prefix_r_dollar)
            lines_out.append(f"Item {item_idx}{label_part}: {val_str}")
            op_tokens.append(f"[{ref_name}: {ref_l.result if ref_l else '?'}]")
            item_idx += 1
        elif token.type == "operator":
            symbol = "×" if token.value == "*" else "÷" if token.value == "/" else token.value
            op_tokens.append(symbol)

    lines_out.append("-----------------------------------")
    lines_out.append(f"Operação: {' '.join(op_tokens)}")
    
    if line.error:
        lines_out.append(f"Resultado: {line.error}")
    else:
        total_str = format_currency_br(line.result, prefix_r_dollar)
        lines_out.append(f"Total: {total_str}")
    
    lines_out.append("-----------------------------------")
    lines_out.append("Gerado via FluxCalc")
    return "\n".join(lines_out)

def format_full_tape_receipt(lines: List[Line], line_lookup: Dict[str, Line], prefix_r_dollar: bool = True) -> str:
    """
    Formats the entire calculation tape into an aggregated receipt.
    """
    if not lines:
        return "--- FluxCalc: Fita Vazia ---"

    out = []
    out.append("===================================")
    out.append("     FLUXCALC: COMPROVANTE GERAL   ")
    out.append("===================================")

    for line in lines:
        out.append(f"\n[ LINHA {line.line_index} ]")
        item_idx = 1
        op_tokens = []
        for token in line.tokens:
            if token.type == "number":
                label_part = f" ({token.label})" if token.label else ""
                try:
                    num_val = float(token.value)
                    val_str = format_currency_br(num_val, prefix_r_dollar)
                except ValueError:
                    val_str = token.value
                out.append(f"  Item {item_idx}{label_part}: {val_str}")
                op_tokens.append(token.value)
                item_idx += 1
            elif token.type == "ref":
                ref_l = line_lookup.get(token.ref_line_id or "")
                ref_name = f"L{ref_l.line_index}" if ref_l else "L?"
                label_part = f" ({token.label or f'de {ref_name}'})"
                val_str = format_currency_br(ref_l.result if ref_l else None, prefix_r_dollar)
                out.append(f"  Item {item_idx}{label_part}: {val_str}")
                op_tokens.append(ref_name)
                item_idx += 1
            elif token.type == "operator":
                symbol = "×" if token.value == "*" else "÷" if token.value == "/" else token.value
                op_tokens.append(symbol)

        out.append(f"  Conta: {' '.join(op_tokens)}")
        if line.error:
            out.append(f"  Total: {line.error}")
        else:
            out.append(f"  Total: {format_currency_br(line.result, prefix_r_dollar)}")

    out.append("\n===================================")
    # If last line has a result, highlight as final result
    last_line = lines[-1]
    if last_line.result is not None and not last_line.error:
        out.append(f"RESULTADO FINAL: {format_currency_br(last_line.result, prefix_r_dollar)}")
        out.append("===================================")
    out.append("Gerado via FluxCalc (Calculadora Reativa)")
    return "\n".join(out)
