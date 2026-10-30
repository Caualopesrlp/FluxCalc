"""FluxCalc - Reactive Dependency Graph."""
from typing import Dict, List, Set, Tuple
from collections import defaultdict, deque
from .models import Line, Token
from .evaluator import evaluate_line

class ReactiveGraph:
    def __init__(self, lines: List[Line]):
        self.lines: List[Line] = lines
        self.line_map: Dict[str, Line] = {line.id: line for line in lines}
        # dependents: key line_id -> set of line_ids that consume its result
        self.dependents: Dict[str, Set[str]] = defaultdict(set)
        # dependencies: key line_id -> set of line_ids that it consumes
        self.dependencies: Dict[str, Set[str]] = defaultdict(set)
        self.rebuild_edges()

    def rebuild_edges(self):
        self.dependents.clear()
        self.dependencies.clear()
        self.line_map = {line.id: line for line in self.lines}

        for line in self.lines:
            for token in line.tokens:
                if token.type == "ref" and token.ref_line_id:
                    self.dependencies[line.id].add(token.ref_line_id)
                    self.dependents[token.ref_line_id].add(line.id)

    def recalculate_cascade(self, starting_line_ids: Set[str]) -> Set[str]:
        """
        Recalculates lines in topological order starting from starting_line_ids.
        Returns the set of line_ids that were recalculated and changed.
        """
        # Find all reachable lines in the dependency graph
        affected_order: List[str] = []
        visited: Set[str] = set()

        def collect(line_id: str):
            if line_id in visited:
                return
            visited.add(line_id)
            for dep in self.dependents.get(line_id, set()):
                collect(dep)

        for s in starting_line_ids:
            collect(s)

        # Sort the affected lines by line_index order (since later lines depend on earlier)
        affected_lines = [self.line_map[lid] for lid in visited if lid in self.line_map]
        affected_lines.sort(key=lambda l: l.line_index)

        recalculated_ids: Set[str] = set()
        for line in affected_lines:
            old_result = line.result
            old_error = line.error
            new_res, new_err = evaluate_line(line, self.line_map)
            line.result = new_res
            line.error = new_err
            if old_result != new_res or old_error != new_err:
                recalculated_ids.add(line.id)

        return recalculated_ids

    def update_token_value(self, line_id: str, token_id: str, new_value: str) -> Set[str]:
        """Updates a token's number value retroactively and recalculates cascade."""
        if line_id not in self.line_map:
            return set()

        line = self.line_map[line_id]
        for token in line.tokens:
            if token.id == token_id:
                token.value = new_value
                break

        # Re-evaluate line itself and all dependents
        return self.recalculate_cascade({line_id})

    def update_token_label(self, line_id: str, token_id: str, label: str) -> bool:
        """Attaches a short note (up to 25 chars) to a token."""
        if line_id not in self.line_map:
            return False

        line = self.line_map[line_id]
        truncated = label[:25].strip() if label else None
        for token in line.tokens:
            if token.id == token_id:
                token.label = truncated
                return True
        return False
