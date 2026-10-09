import os
from sqlmodel import SQLModel, create_engine, Session

# We'll use SQLite by default for zero-friction local development,
# but structure it so we can easily swap to Postgres.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./second_brain.db")

# In SQLite, we need to disable same_thread check for FastAPI
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=True, connect_args=connect_args)

def init_db():
    # Import domain models to ensure they are registered with SQLModel
    from app.models.domain import User, Document, Block
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
