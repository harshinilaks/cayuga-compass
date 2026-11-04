from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_alternatives():
    """Get sustainable alternatives database."""
    # TODO: Implement alternatives database
    return {"alternatives": []}
