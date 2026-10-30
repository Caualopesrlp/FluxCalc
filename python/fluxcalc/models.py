"""FluxCalc - Core Data Models and Types."""
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Set, Any
import time
import uuid

@dataclass
class Token:
    id: str
    type: str  # 'number', 'operator', 'ref'
    value: str
    ref_line_id: Optional[str] = None
    label: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "type": self.type,
            "value": self.value,
            "ref_line_id": self.ref_line_id,
            "label": self.label
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Token":
        return cls(
            id=data["id"],
            type=data["type"],
            value=data["value"],
            ref_line_id=data.get("ref_line_id"),
            label=data.get("label")
        )

@dataclass
class Line:
    id: str
    line_index: int
    tokens: List[Token] = field(default_factory=list)
    result: Optional[float] = None
    error: Optional[str] = None
    is_sealed: bool = False
    timestamp: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "line_index": self.line_index,
            "tokens": [t.to_dict() for t in self.tokens],
            "result": self.result,
            "error": self.error,
            "is_sealed": self.is_sealed,
            "timestamp": self.timestamp
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Line":
        return cls(
            id=data["id"],
            line_index=data["line_index"],
            tokens=[Token.from_dict(t) for t in data.get("tokens", [])],
            result=data.get("result"),
            error=data.get("error"),
            is_sealed=data.get("is_sealed", False),
            timestamp=data.get("timestamp", time.time())
        )
