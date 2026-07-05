"""Provider-agnostic LLM client (ADR-004).

Wraps a chat model so the rest of the engine never depends on a specific
provider. Switch providers via env vars (LLM_PROVIDER / LLM_BASE_URL).

Groq, OpenRouter, and local Ollama all expose an OpenAI-compatible API, so
`langchain-openai` with a custom base_url covers most free options.
"""
from __future__ import annotations

from functools import lru_cache

from app.config import get_settings


def llm_available() -> bool:
    """True if an LLM is configured. Nodes fall back to mock output otherwise,
    so the graph still streams end-to-end for frontend development."""
    settings = get_settings()
    return settings.llm_provider == "ollama" or bool(settings.llm_api_key)


@lru_cache
def _planner():
    return _make_model(get_settings().llm_planner_model)


@lru_cache
def _coder():
    return _make_model(get_settings().llm_coder_model)


def _make_model(model: str):
    from langchain_openai import ChatOpenAI

    settings = get_settings()
    kwargs: dict = {
        "model": model,
        "temperature": 0,
        "timeout": settings.llm_timeout_seconds,
        "request_timeout": settings.llm_timeout_seconds,
        "max_retries": 0,
    }
    if settings.llm_api_key:
        kwargs["api_key"] = settings.llm_api_key
    if settings.llm_base_url:
        kwargs["base_url"] = settings.llm_base_url
    return ChatOpenAI(**kwargs)


def complete(prompt: str, *, coder: bool = False, system: str | None = None) -> str:
    """Single-shot completion. `coder=True` uses the stronger coding model."""
    from langchain_core.messages import HumanMessage, SystemMessage

    model = _coder() if coder else _planner()
    messages = []
    if system:
        messages.append(SystemMessage(content=system))
    messages.append(HumanMessage(content=prompt))
    resp = model.invoke(messages)
    return resp.content if isinstance(resp.content, str) else str(resp.content)
