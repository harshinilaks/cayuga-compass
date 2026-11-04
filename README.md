# STAMP - Sustainable Tourism Asset Management Program

STAMP is an agentic AI-powered sustainable tourism platform for visitors to Ithaca and Tompkins County, New York. Developed by Cornell Sustainability Consultants in partnership with the Tompkins County Tourism Program.

## Features

- **Carbon Footprint Calculator**: Deterministic emissions modeling based on EPA and UK DESNZ factors
- **Four-Step Trip Planner**: Transportation, accommodation, activities, and results
- **Visitor Personas**: Pre-populated scenarios for regional, leisure, and university visitors
- **Personalized Itineraries**: Curated local tourism recommendations
- **Sustainable Alternatives**: Lower-carbon travel options
- **AI Travel Assistant**: Tool-calling agent for trip planning (coming soon)

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React
- TypeScript
- Tailwind CSS
- Recharts

### Backend
- Python 3.11+
- FastAPI
- Pydantic
- pytest

## Project Structure

```
stamp-ai/
├── frontend/          # Next.js frontend
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities
│   └── types/        # TypeScript types
├── backend/          # FastAPI backend
│   ├── app/          # Application code
│   │   ├── api/      # API endpoints
│   │   ├── models/   # Pydantic models
│   │   └── services/ # Business logic
│   ├── data/         # JSON datasets
│   └── tests/        # Test suite
├── research/         # Team research deliverables
└── docs/            # Documentation
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pydantic pytest httpx
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Running the Application

Start the backend server:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Start the frontend (in a new terminal):
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/personas` - Get visitor personas
- `GET /api/emissions/factors` - Get emission factors
- `POST /api/emissions/calculate` - Calculate trip footprint
- `POST /api/emissions/compare` - Compare trip scenarios
- `GET /api/attractions` - Get local attractions (coming soon)
- `GET /api/itineraries/templates` - Get itinerary templates (coming soon)
- `POST /api/itineraries/generate` - Generate itinerary (coming soon)
- `GET /api/alternatives` - Get sustainable alternatives (coming soon)
- `POST /api/agent/chat` - AI agent chat (coming soon)

## Testing

Run backend tests:
```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

## Research Documentation

See `docs/research-synthesis.md` for a comprehensive synthesis of the team's research deliverables, including:
- Visitor personas and statistics
- Emissions methodology and factors
- UI design specifications
- Data limitations and assumptions

## License

This project is developed for Cornell Sustainability Consultants and the Tompkins County Tourism Program.

## Acknowledgments

- Cornell Sustainability Consultants
- Tompkins County Tourism Program
- Future Partners (Visitor Profile Study)
- U.S. EPA (GHG Emission Factors)
- UK DESNZ (GHG Conversion Factors)
