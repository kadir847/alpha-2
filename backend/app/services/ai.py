import json
from abc import ABC, abstractmethod
from collections.abc import AsyncIterator

import httpx

from app.core.config import settings


class AIProvider(ABC):
    @abstractmethod
    async def stream(self, messages: list[dict[str, str]]) -> AsyncIterator[str]:
        raise NotImplementedError

    async def complete(self, messages: list[dict[str, str]]) -> str:
        chunks = []
        async for chunk in self.stream(messages):
            chunks.append(chunk)
        return "".join(chunks)


class DemoProvider(AIProvider):
    @staticmethod
    def _is_violent_request(text: str) -> bool:
        normalized = text.lower()
        violent_terms = [
            "kill",
            "murder",
            "shoot",
            "stab",
            "bomb",
            "attack",
            "hurt",
            "violence",
            "assault",
            "weapon",
            "torture",
            "harm",
        ]
        return any(term in normalized for term in violent_terms)

    async def stream(self, messages: list[dict[str, str]]) -> AsyncIterator[str]:
        latest = next((message["content"] for message in reversed(messages) if message["role"] == "user"), "")
        if self._is_violent_request(latest):
            response = (
                "I’m here to help with safe and constructive requests, but I can’t assist with violence or harm. "
                "Please ask me something else."
            )
        else:
            response = (
                "Alpha 2 is running in demo mode because no provider API key is configured. "
                f"You said: {latest}"
            )
        for word in response.split(" "):
            yield word + " "


class OpenAICompatibleProvider(AIProvider):
    def __init__(self, base_url: str, api_key: str, model: str):
        self.base_url = base_url
        self.api_key = api_key
        self.model = model

    async def stream(self, messages: list[dict[str, str]]) -> AsyncIterator[str]:
        payload = {"model": self.model, "messages": messages, "stream": True}
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream("POST", self.base_url, json=payload, headers=headers) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    data = line.removeprefix("data: ").strip()
                    if data == "[DONE]":
                        break
                    chunk = json.loads(data)
                    token = chunk["choices"][0].get("delta", {}).get("content")
                    if token:
                        yield token


class AnthropicProvider(AIProvider):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    async def stream(self, messages: list[dict[str, str]]) -> AsyncIterator[str]:
        system = "\n\n".join(item["content"] for item in messages if item["role"] == "system")
        anthropic_messages = [item for item in messages if item["role"] != "system"]
        payload = {
            "model": self.model,
            "max_tokens": 2048,
            "system": system,
            "messages": anthropic_messages,
            "stream": True,
        }
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream("POST", "https://api.anthropic.com/v1/messages", json=payload, headers=headers) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    event = json.loads(line.removeprefix("data: "))
                    if event.get("type") == "content_block_delta":
                        token = event.get("delta", {}).get("text")
                        if token:
                            yield token


def get_ai_provider() -> AIProvider:
    provider = settings.ai_provider.lower()
    if provider == "groq" and settings.groq_api_key:
        return OpenAICompatibleProvider("https://api.groq.com/openai/v1/chat/completions", settings.groq_api_key, settings.ai_model)
    if provider == "anthropic" and settings.anthropic_api_key:
        return AnthropicProvider(settings.anthropic_api_key, settings.ai_model)
    if settings.openai_api_key:
        return OpenAICompatibleProvider("https://api.openai.com/v1/chat/completions", settings.openai_api_key, settings.ai_model)
    return DemoProvider()

