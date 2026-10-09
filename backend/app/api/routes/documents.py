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

class DocumentResponse(BaseModel):
    id: int
    title: str
    category: str | None
    created_at: str | None = None
    updated_at: str | None = None
    content: str = ""

# For now, we mock a default user since we don't have auth yet
def get_current_user(session: Session = Depends(get_session)) -> User:
    user = session.exec(select(User).where(User.username == "default")).first()
    if not user:
        user = User(username="default")
        session.add(user)
        session.commit()
        session.refresh(user)
    return user

@router.get("/", response_model=List[DocumentResponse])
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
    
    result = []
    for doc in docs:
        content = ""
        if doc.blocks:
            content = doc.blocks[0].content
        
        result.append(DocumentResponse(
            id=doc.id,
            title=doc.title,
            category=doc.category or "Uncategorized",
            created_at=doc.created_at.isoformat() if doc.created_at else None,
            updated_at=doc.updated_at.isoformat() if doc.updated_at else None,
            content=content
        ))
    return result

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
