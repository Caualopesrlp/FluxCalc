import unittest
import sys
import os

# Add python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python")))

from fluxcalc.models import Token, Line
from fluxcalc.evaluator import evaluate_line
from fluxcalc.graph import ReactiveGraph
from fluxcalc.persistence import export_state_json, import_state_json

class TestFluxCalc(unittest.TestCase):
    def test_basic_evaluation(self):
        line = Line(
            id="l1",
            line_index=1,
            tokens=[
                Token(id="t1", type="number", value="10"),
                Token(id="t2", type="operator", value="+"),
                Token(id="t3", type="number", value="5"),
                Token(id="t4", type="operator", value="*"),
                Token(id="t5", type="number", value="2"),
            ]
        )
        res, err = evaluate_line(line, {})
        self.assertIsNone(err)
        # Operator precedence: 10 + (5 * 2) = 20
        self.assertEqual(res, 20.0)

    def test_division_by_zero(self):
        line = Line(
            id="l1",
            line_index=1,
            tokens=[
                Token(id="t1", type="number", value="50"),
                Token(id="t2", type="operator", value="/"),
                Token(id="t3", type="number", value="0"),
            ]
        )
        res, err = evaluate_line(line, {})
        self.assertIsNone(res)
        self.assertEqual(err, "Erro: Divisão por 0")

    def test_retroactive_cascade(self):
        # Line 1: 50 + 20 = 70
        l1 = Line(
            id="l1",
            line_index=1,
            tokens=[
                Token(id="t1", type="number", value="50"),
                Token(id="t2", type="operator", value="+"),
                Token(id="t3", type="number", value="20"),
            ]
        )
        res1, _ = evaluate_line(l1, {})
        l1.result = res1

        # Line 2: (Ref L1) / 2 = 35
        l2 = Line(
            id="l2",
            line_index=2,
            tokens=[
                Token(id="t4", type="ref", value="Ref L1", ref_line_id="l1"),
                Token(id="t5", type="operator", value="/"),
                Token(id="t6", type="number", value="2"),
            ]
        )
        res2, _ = evaluate_line(l2, {"l1": l1})
        l2.result = res2

        self.assertEqual(l1.result, 70.0)
        self.assertEqual(l2.result, 35.0)

        # Reactive Graph
        graph = ReactiveGraph([l1, l2])

        # Retroactive edit on Line 1: change 50 to 80 (80 + 20 = 100)
        affected = graph.update_token_value("l1", "t1", "80")

        self.assertIn("l1", affected)
        self.assertIn("l2", affected)
        self.assertEqual(l1.result, 100.0)
        self.assertEqual(l2.result, 50.0)  # 100 / 2 = 50 in cascade!

    def test_label_note(self):
        l1 = Line(
            id="l1",
            line_index=1,
            tokens=[Token(id="t1", type="number", value="150")]
        )
        graph = ReactiveGraph([l1])
        success = graph.update_token_label("l1", "t1", "Supermercado Mensal com Desconto Extra")
        self.assertTrue(success)
        # Note capped at 25 chars
        self.assertEqual(len(l1.tokens[0].label), 25)

if __name__ == "__main__":
    unittest.main()
