from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, brain
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Second Brain — Zero-friction personal knowledge base",
    version="0.1.0",
)

# CORS — allow the Next.js frontend to talk to us
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount route modules
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(brain.router, prefix="/api/brain", tags=["Brain"])


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
        "status": "running",
    }
