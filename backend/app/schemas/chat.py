from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Role = Literal["user", "assistant", "system"]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=20000)
    conversation_id: int | None = None


class MessageRead(BaseModel):
    id: int
    role: Role
    content: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class ChatResponse(BaseModel):
    conversation_id: int
    user_message: MessageRead
    assistant_message: MessageRead


class ConversationRead(BaseModel):
    id: int
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetail(ConversationRead):
    messages: list[MessageRead]

