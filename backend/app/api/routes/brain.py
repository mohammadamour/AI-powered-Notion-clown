from fastapi import APIRouter, HTTPException
from app.models.schemas import BrainDumpRequest, ProcessResponse
from app.services.gardener import process_brain_dump

router = APIRouter()


@router.post("/process", response_model=ProcessResponse)
async def process_dump(request: BrainDumpRequest):
    """
    Process a raw brain dump through the AI Gardener.

    Takes unstructured text and returns:
    - A concise title
    - A polished summary
    - Auto-generated tags
    - A suggested Mind Tree category
    - Extracted action items
    - Suggested connections to other topics
    """
    try:
        result = await process_brain_dump(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
