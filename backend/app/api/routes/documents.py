from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import List

from app.core.db import get_session
from app.models.domain import Document, Block, User
from app.models.schemas import ProcessedThought

router = APIRouter()

class CreateDocumentRequest(BaseModel):
    title: str
    content_markdown: str
    category: str = "Uncategorized"

# For now, we mock a default user since we don't have auth yet
def get_current_user(session: Session = Depends(get_session)) -> User:
    user = session.exec(select(User).where(User.username == "default")).first()
    if not user:
        user = User(username="default")
        session.add(user)
        session.commit()
        session.refresh(user)
    return user

@router.get("/", response_model=List[Document])
def list_documents(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """List all documents for the current user, ordered by newest first."""
    docs = session.exec(
        select(Document)
        .where(Document.owner_id == user.id)
        .order_by(Document.created_at.desc())
    ).all()
    return docs

@router.post("/", response_model=Document)
def create_document(
    req: CreateDocumentRequest,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user)
):
    """Create a new document with an initial block."""
    doc = Document(title=req.title, category=req.category, owner_id=user.id)
    session.add(doc)
    session.commit()
    session.refresh(doc)
    
    # Create the block representing the content
    block = Block(
        id=f"blk_{doc.id}_1",
        type="markdown",
        content=req.content_markdown,
        order_index=0,
        document_id=doc.id
    )
    session.add(block)
    session.commit()
    session.refresh(doc)
    
    return doc
