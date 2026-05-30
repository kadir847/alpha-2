import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.deps import get_current_user
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai import get_ai_provider
from app.services.chat import add_message, build_context, get_or_create_conversation, load_conversation_with_messages, update_summary_if_needed

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        conversation = get_or_create_conversation(db, current_user, payload.conversation_id, payload.message)
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    user_message = add_message(db, conversation.id, "user", payload.message)
    conversation = load_conversation_with_messages(db, conversation.id)
    context = build_context(conversation)
    provider = get_ai_provider()
    assistant_text = await provider.complete(context)
    assistant_message = add_message(db, conversation.id, "assistant", assistant_text)
    update_summary_if_needed(db, conversation)
    return ChatResponse(conversation_id=conversation.id, user_message=user_message, assistant_message=assistant_message)


@router.post("/stream")
async def stream_chat(payload: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        conversation = get_or_create_conversation(db, current_user, payload.conversation_id, payload.message)
    except ValueError:
        raise HTTPException(status_code=404, detail="Conversation not found")
    user_message = add_message(db, conversation.id, "user", payload.message)
    conversation = load_conversation_with_messages(db, conversation.id)
    context = build_context(conversation)
    provider = get_ai_provider()

    async def event_stream():
        collected: list[str] = []
        yield f"event: meta\ndata: {json.dumps({'conversation_id': conversation.id, 'user_message': {'id': user_message.id, 'role': user_message.role, 'content': user_message.content, 'timestamp': user_message.timestamp.isoformat()}})}\n\n"
        async for token in provider.stream(context):
            collected.append(token)
            yield f"event: token\ndata: {json.dumps({'token': token})}\n\n"
        assistant_message = add_message(db, conversation.id, "assistant", "".join(collected))
        fresh = db.scalar(
            select(Conversation).where(Conversation.id == conversation.id).options(selectinload(Conversation.messages))
        )
        if fresh is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
        update_summary_if_needed(db, fresh)
        yield f"event: done\ndata: {json.dumps({'assistant_message': {'id': assistant_message.id, 'role': assistant_message.role, 'content': assistant_message.content, 'timestamp': assistant_message.timestamp.isoformat()}})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
