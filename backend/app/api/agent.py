from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []


@router.post("/chat")
def chat(request: ChatRequest):
    """AI agent chat endpoint."""
    # TODO: Implement AI agent
    return {"response": "AI agent not yet implemented"}
