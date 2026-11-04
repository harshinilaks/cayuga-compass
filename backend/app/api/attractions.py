from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def get_attractions():
    """Get all local attractions."""
    # TODO: Implement attractions dataset
    return {"attractions": []}
