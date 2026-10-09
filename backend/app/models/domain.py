from typing import Optional, List
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    documents: List["Document"] = Relationship(back_populates="owner")


class Document(SQLModel, table=True):
    """Represents a page or a node in the Mind Tree"""
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    category: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    owner_id: int = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="documents")
    
    blocks: List["Block"] = Relationship(back_populates="document")


class Block(SQLModel, table=True):
    """Represents a single paragraph, image, or list item (BlockNote integration)"""
    id: str = Field(primary_key=True, description="The unique ID from BlockNote")
    type: str = Field(description="Block type (e.g. 'paragraph', 'heading', 'bulletListItem')")
    content: str = Field(description="JSON serialized content of the block")
    
    # Position in the document
    order_index: int = Field(index=True)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    document_id: int = Field(foreign_key="document.id")
    document: Document = Relationship(back_populates="blocks")
