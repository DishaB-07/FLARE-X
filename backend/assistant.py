"""Backward-compatible import path for existing integrations and tests.

Implementation lives in backend.services.assistant. This alias deliberately
exposes the same module so monkeypatching Gemini in existing tests still works.
"""
import sys
from backend.services import assistant as _implementation

sys.modules[__name__] = _implementation
