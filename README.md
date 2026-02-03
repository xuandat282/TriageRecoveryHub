# AI Support Triage Hub

A production-ready monorepo for managing support tickets with AI-powered triage and categorization.

## Tech Stack

- **Backend**: Python FastAPI, SQLAlchemy (Async), Pydantic, Uvicorn
- **Frontend**: Next.js 16 (App Router), TailwindCSS, TypeScript
- **Database**: PostgreSQL
- **Infrastructure**: Docker Compose

## Project Structure

```
TriageRecoveryHub/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # FastAPI application
│   │   ├── models.py       # SQLAlchemy models
│   │   ├── schemas.py      # Pydantic schemas
│   │   ├── database.py     # Database configuration
│   │   └── services.py     # Background task services
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js frontend
│   └── (Next.js app structure)
└── docker-compose.yml      # Docker orchestration
```

## Features

- **Async Ticket Creation**: POST /tickets returns 201 immediately
- **Background AI Processing**: Asynchronous LLM categorization and response drafting
- **Status Tracking**: Real-time ticket status updates (pending → processing → completed/failed)
- **Error Handling**: Robust error handling in background tasks
- **RESTful API**: Clean API design with proper validation

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Running with Docker Compose

1. Clone the repository and navigate to the project directory:
   ```bash
   cd TriageRecoveryHub
   ```

2. Start all services:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

### Local Development

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### POST /tickets
Create a new support ticket.

**Request Body:**
```json
{
  "raw_content": "My application is crashing when I try to login"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-here",
  "raw_content": "My application is crashing when I try to login",
  "status": "pending",
  "category": null,
  "urgency": null,
  "sentiment_score": null,
  "draft_response": null,
  "created_at": "2026-02-02T13:52:45.123Z"
}
```

### GET /tickets
List all tickets with pagination.

**Query Parameters:**
- `skip`: Number of tickets to skip (default: 0)
- `limit`: Maximum number of tickets to return (default: 100)

### GET /tickets/{ticket_id}
Get a specific ticket by ID.

## Database Schema

### Tickets Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| raw_content | Text | Original ticket content |
| status | Enum | pending, processing, completed, failed |
| category | String | AI-generated category |
| urgency | String | AI-generated urgency level |
| sentiment_score | Integer | AI-generated sentiment score |
| draft_response | Text | AI-generated draft response |
| created_at | DateTime | Timestamp of creation |

## Environment Variables

Create a `.env` file in the backend directory (see `.env.example`):

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/triage_hub
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=triage_hub
```

## Development Notes

- The AI processing is currently mocked with a 3-second delay
- In production, replace `process_ticket_with_ai` with actual LLM API calls
- Background tasks use separate database sessions to avoid conflicts
- CORS is configured for localhost:3000 (frontend)

## License

MIT
