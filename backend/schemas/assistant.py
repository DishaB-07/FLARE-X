"""Request validation schemas; API response JSON remains backwards compatible."""
from pydantic import BaseModel, Field


class AssistantQuestion(BaseModel):
    question: str = Field(min_length=3, max_length=500)

from typing import Literal
from pydantic import field_validator


class CompareQuestion(BaseModel):
    ids: list[str] = Field(min_length=2, max_length=3)
    question: str | None = Field(default=None, max_length=500)

    @field_validator('ids')
    @classmethod
    def valid_ids(cls, ids: list[str]) -> list[str]:
        import re
        ids = [item.strip().upper() for item in ids]
        if len(ids) != len(set(ids)):
            raise ValueError('Select two or three different investigations.')
        if any(not re.fullmatch(r'PSI-\d+', item) for item in ids):
            raise ValueError('Investigation IDs must use the PSI-26 format.')
        return ids


class BriefQuestion(BaseModel):
    theme: Literal['prevention', 'detection', 'suppression', 'modelling']
    question: str | None = Field(default=None, max_length=500)
