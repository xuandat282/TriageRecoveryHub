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
- **AI-Powered Processing**: OpenAI GPT-4o-mini analyzes tickets in the background
- **Intelligent Categorization**: Automatic ticket categorization (Technical, Billing, Account, General)
- **Urgency Detection**: AI-determined urgency levels (Low, Medium, High, Critical)
- **Sentiment Analysis**: Sentiment scoring from 0-100
- **Draft Responses**: AI-generated professional responses
- **Status Tracking**: Real-time ticket status updates (pending → processing → completed/failed)
- **Error Handling**: Robust error handling in background tasks
- **RESTful API**: Clean API design with proper validation

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- **OpenAI API Key** (required for AI ticket processing)

### Running with Docker Compose

1. Clone the repository and navigate to the project directory:
   ```bash
   cd TriageRecoveryHub
   ```

2. **Set up your OpenAI API key:**
   ```bash
   # Create .env file in the root directory
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   # OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Start all services:
   ```bash
   ./start.sh
   ```
   
   Or manually:
   ```bash
   docker compose up --build
   ```

4. Access the application:
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

### Root Directory (.env)

Create a `.env` file in the root directory for Docker Compose:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Backend Directory (backend/.env)

For local development, create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/triage_hub
OPENAI_API_KEY=sk-your-actual-api-key-here
```

## Development Notes

- **AI Processing**: Uses OpenAI GPT-4o-mini for real-time ticket analysis
- **Auto-refresh**: Frontend polls every 5 seconds for status updates
- **Database**: PostgreSQL in Docker with persistent volume
- **Development Mode**: Backend and frontend have hot-reload enabled
- **Type Safety**: Full TypeScript on frontend, Pydantic on backend
- **API Costs**: Be aware of OpenAI API usage costs when processing tickets

## License

MIT
