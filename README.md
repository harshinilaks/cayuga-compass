# Cayuga Compass

Cayuga Compass is an agentic AI-powered sustainable tourism platform for visitors to Ithaca and Tompkins County, New York. Developed by Cornell Sustainability Consultants in partnership with the Tompkins County Tourism Program.

## Features

- **Carbon Footprint Calculator**: Deterministic emissions modeling based on EPA and UK DESNZ factors
- **Four-Step Trip Planner**: Transportation, accommodation, activities, and results
- **Visitor Personas**: Pre-populated scenarios for regional, leisure, and university visitors
- **Personalized Itineraries**: Curated local tourism recommendations
- **Sustainable Alternatives**: Lower-carbon travel options

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
cayuga-compass/
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
- `GET /api/attractions` - Get local attractions (filters: category, group, tags, area, tcat_access, admission, season)
- `GET /api/attractions/{id}` - Get attraction details
- `GET /api/lodging` - Get researched lodging properties
- `GET /api/lodging/{id}` - Get lodging property details
- `GET /api/transportation` - Get transportation services (filters: scope, mode, accessible, seasonal)
- `GET /api/transportation/{id}` - Get service details
- `GET /api/mobility/connections` - Get documented attraction/lodging transit connections
- `GET /api/itineraries/templates` - Get itinerary templates
- `POST /api/itineraries/generate` - Generate itinerary (interests, days, mobility, season_month, lodging_id)
- `GET /api/alternatives` - Get sustainable alternatives
- `POST /api/alternatives/generate` - Generate scenario alternatives for a baseline trip
- `POST /api/alternatives/recommend` - Context-aware recommendations (lodging, mobility, season, origin)
- `POST /api/agent/chat` - AI agent chat

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
