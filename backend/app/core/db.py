import os
from sqlmodel import SQLModel, create_engine, Session

from app.core.config import settings

# In SQLite, we need to disable same_thread check for FastAPI
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, echo=True, connect_args=connect_args)

def init_db():
    # Import domain models to ensure they are registered with SQLModel
    from app.models.domain import User, Document, Block
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
