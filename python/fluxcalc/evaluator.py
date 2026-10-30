"""FluxCalc - Mathematical Evaluator."""
from typing import List, Optional, Tuple, Dict
from .models import Token, Line

class EvaluationError(Exception):
    pass

def evaluate_line(line: Line, line_lookup: Dict[str, Line]) -> Tuple[Optional[float], Optional[str]]:
    """
    Evaluates tokens in a line, resolving any line references.
    Returns (result, error_message).
    """
    tokens = line.tokens
    if not tokens:
        return None, None

    # Resolve values for each token
    resolved: List[Tuple[str, str]] = []  # List of (type, value_str)
    
    for token in tokens:
        if token.type == "ref":
            if not token.ref_line_id or token.ref_line_id not in line_lookup:
                return None, "Referência inválida"
            ref_line = line_lookup[token.ref_line_id]
            if ref_line.error:
                return None, f"Depende de erro em L{ref_line.line_index}"
            if ref_line.result is None:
                return None, f"L{ref_line.line_index} sem resultado"
            resolved.append(("number", str(ref_line.result)))
        elif token.type == "number":
            resolved.append(("number", token.value))
        elif token.type == "operator":
            resolved.append(("operator", token.value))
        else:
            return None, f"Token desconhecido: {token.type}"

    # If the last token is an operator and line is not complete, return intermediate result up to last number
    # If the list starts with an operator (like - for negative), handle unary or ignore
    if not resolved:
        return None, None

    # Filter trailing operator for live preview if user is currently typing
    clean_resolved = list(resolved)
    if clean_resolved and clean_resolved[-1][0] == "operator":
        clean_resolved.pop()

    if not clean_resolved:
        return None, None

    # Parse into numbers and operators, evaluating * and / first, then + and -
    try:
        # Step 1: Collect sequence of numbers and operators
        numbers: List[float] = []
        operators: List[str] = []

        expect_number = True
        for token_type, val in clean_resolved:
            if expect_number:
                if token_type == "number":
                    try:
                        numbers.append(float(val))
                        expect_number = False
                    except ValueError:
                        return None, f"Número inválido: {val}"
                elif token_type == "operator" and val == "-":
                    # Unary minus at the start or after operator
                    # Handled by next number
                    pass
                else:
                    return None, "Sintaxe incompleta"
            else:
                if token_type == "operator":
                    operators.append(val)
                    expect_number = True
                else:
                    return None, "Dois números seguidos sem operador"

        if len(numbers) == 0:
            return None, None

        if len(numbers) != len(operators) + 1:
            return None, "Sintaxe incompleta"

        # Step 2: High precedence (* and /)
        i = 0
        while i < len(operators):
            op = operators[i]
            if op in ("*", "×"):
                numbers[i] = numbers[i] * numbers[i + 1]
                del numbers[i + 1]
                del operators[i]
            elif op in ("/", "÷"):
                divisor = numbers[i + 1]
                if divisor == 0:
                    return None, "Erro: Divisão por 0"
                numbers[i] = numbers[i] / divisor
                del numbers[i + 1]
                del operators[i]
            else:
                i += 1

        # Step 3: Low precedence (+ and -)
        result = numbers[0]
        for op, num in zip(operators, numbers[1:]):
            if op == "+":
                result += num
            elif op in ("-", "−"):
                result -= num
            else:
                return None, f"Operador desconhecido: {op}"

        # Round very small floating point inaccuracies (e.g. 0.1 + 0.2 = 0.30000000000000004)
        result = round(result, 10)
        # If integer, keep as float or format nicely
        if result.is_integer():
            result = float(int(result))

        return result, None

    except ZeroDivisionError:
        return None, "Erro: Divisão por 0"
    except Exception as e:
        return None, f"Erro: {str(e)}"
