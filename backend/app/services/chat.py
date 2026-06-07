from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User


def title_from_message(message: str) -> str:
    cleaned = " ".join(message.strip().split())
    return cleaned[:60] or "New chat"


def get_or_create_conversation(db: Session, user: User, conversation_id: int | None, first_message: str) -> Conversation:
    if conversation_id:
        conversation = db.scalar(
            select(Conversation)
            .where(Conversation.id == conversation_id, Conversation.user_id == user.id)
            .options(selectinload(Conversation.messages))
        )
        if conversation is None:
            raise ValueError("Conversation not found")
        return conversation

    conversation = Conversation(user_id=user.id, title=title_from_message(first_message))
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return db.scalar(select(Conversation).where(Conversation.id == conversation.id).options(selectinload(Conversation.messages)))


def add_message(db: Session, conversation_id: int, role: str, content: str) -> Message:
    message = Message(conversation_id=conversation_id, role=role, content=content)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def load_conversation_with_messages(db: Session, conversation_id: int) -> Conversation:
    conversation = db.scalar(
        select(Conversation).where(Conversation.id == conversation_id).options(selectinload(Conversation.messages))
    )
    if conversation is None:
        raise ValueError("Conversation not found")
    return conversation


def build_context(conversation: Conversation) -> list[dict[str, str]]:
    messages = list(conversation.messages)[-settings.max_context_messages :]
    context: list[dict[str, str]] = [
        {
            "role": "system",
            "content": (
                "You are ChatGPT, a helpful and professional AI assistant. Answer user requests clearly, accurately, and politely. "
                "If a user asks for violence, illegal behavior, or harm, refuse safely and do not provide guidance for those requests. "
                "Otherwise, help with creative, technical, and conversational questions to the best of your ability."
            ),
        }
    ]
    if conversation.summary:
        context.append({"role": "system", "content": f"Conversation summary so far: {conversation.summary}"})
    context.extend({"role": item.role, "content": item.content} for item in messages)
    return context


def update_summary_if_needed(db: Session, conversation: Conversation) -> None:
    messages = list(conversation.messages)
    if len(messages) <= settings.max_context_messages:
        return
    older = messages[: -settings.max_context_messages]
    excerpt = " ".join(message.content.strip().replace("\n", " ") for message in older[-8:])
    conversation.summary = (excerpt[:1500] + "...") if len(excerpt) > 1500 else excerpt
    db.add(conversation)
    db.commit()
