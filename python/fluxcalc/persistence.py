"""FluxCalc - Local Persistence and State Management."""
import json
from typing import List, Dict, Any, Optional
from .models import Line, Token

def export_state_json(lines: List[Line], active_tokens: Optional[List[Token]] = None) -> str:
    data = {
        "version": 1,
        "appName": "FluxCalc",
        "lines": [line.to_dict() for line in lines],
        "active_tokens": [t.to_dict() for t in (active_tokens or [])]
    }
    return json.dumps(data, indent=2, ensure_ascii=False)

def import_state_json(json_str: str) -> Dict[str, Any]:
    data = json.loads(json_str)
    lines = [Line.from_dict(l) for l in data.get("lines", [])]
    active_tokens = [Token.from_dict(t) for t in data.get("active_tokens", [])]
    return {
        "lines": lines,
        "active_tokens": active_tokens
    }
