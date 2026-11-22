from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import emissions, personas, attractions, itineraries, alternatives, agent, distance

app = FastAPI(
    title="Cayuga Compass API",
    description="Cayuga Compass - Sustainable tourism trip planning for Ithaca, NY",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emissions.router, prefix="/api/emissions", tags=["emissions"])
app.include_router(personas.router, prefix="/api/personas", tags=["personas"])
app.include_router(attractions.router, prefix="/api/attractions", tags=["attractions"])
app.include_router(itineraries.router, prefix="/api/itineraries", tags=["itineraries"])
app.include_router(alternatives.router, prefix="/api/alternatives", tags=["alternatives"])
app.include_router(agent.router, prefix="/api/agent", tags=["agent"])
app.include_router(distance.router, prefix="/api/distance", tags=["distance"])


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
