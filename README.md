# AI Support Triage Hub

A production-ready, event-driven support ticket management system with real-time AI-powered categorization and response generation.

## Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Browser"]
    end
    
    subgraph Frontend["Frontend (Next.js)"]
        UI["React Components"]
        SSE["EventSource (SSE)"]
        TQ["TanStack Query"]
    end
    
    subgraph Backend["Backend (FastAPI)"]
        API["REST API"]
        Stream["SSE Stream"]
        BG["Background Tasks"]
        EM["Event Manager"]
    end
    
    subgraph AI["AI Layer"]
        GEMINI["Gemini 2.5 Flash"]
    end
    
    subgraph Data["Data Layer"]
        PG[("PostgreSQL")]
    end
    
    Browser --> UI
    UI --> TQ
    TQ -->|"POST /tickets"| API
    Browser -->|"EventSource"| Stream
    API --> PG
    API -->|"add_task()"| BG
    BG -->|"Async"| GEMINI
    BG -->|"Update"| PG
    BG -->|"Broadcast"| EM
    EM -->|"Push Event"| Stream
    Stream -->|"Real-time"| SSE
    SSE -->|"Invalidate Cache"| TQ
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 (App Router) | React framework with SSR |
| **Styling** | TailwindCSS | Utility-first CSS |
| **State Management** | TanStack Query | Server state + caching |
| **Real-time** | Server-Sent Events (SSE) | Push notifications |
| **API** | FastAPI | High-performance async API |
| **Validation** | Pydantic | Request/response schemas |
| **ORM** | SQLAlchemy (Async) | Database abstraction |
| **Database** | PostgreSQL 15 | Relational data store |
| **AI** | Google Gemini 2.5 Flash | Ticket analysis & categorization |
| **Containerization** | Docker Compose | Multi-service orchestration |

## Key Features

### Real-Time Event-Driven Architecture
- **Server-Sent Events (SSE)**: Zero polling overhead, instant UI updates
- **Non-blocking API**: Immediate `201 Created` response, AI processing in background
- **Event Broadcasting**: Worker notifies all connected clients on completion

### AI-Powered Ticket Analysis
- **Intelligent Categorization**: Technical, Billing, Account, General, Spam
- **Urgency Detection**: Critical, High, Medium, Low (based on impact analysis)
- **Sentiment Analysis**: 1-10 scale emotional scoring
- **Draft Responses**: Context-aware, professional AI-generated replies
- **Fallback Resilience**: Keyword-based analysis when AI is unavailable

### Production-Ready Design
- **Async Everything**: Non-blocking I/O throughout the stack
- **Clean Architecture**: Separation of concerns, DRY principles
- **Type Safety**: Full TypeScript frontend, Pydantic backend
- **Error Handling**: Graceful degradation, comprehensive logging
- **CORS Configuration**: Secure cross-origin setup

## Project Structure

```
TriageRecoveryHub/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app, routes, SSE endpoint
│   │   ├── models.py         # SQLAlchemy ORM models
│   │   ├── schemas.py        # Pydantic validation schemas
│   │   ├── database.py       # Async session management
│   │   ├── services.py       # Business logic, AI integration
│   │   └── events.py         # SSE EventManager
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   └── page.tsx          # Main application page
│   ├── components/
│   │   ├── TicketForm.tsx    # Ticket submission form
│   │   ├── TicketList.tsx    # Real-time ticket dashboard
│   │   ├── TicketCard.tsx    # Individual ticket display
│   │   └── TicketDetail.tsx  # Ticket detail modal
│   ├── hooks/
│   │   └── useTicketEvents.ts # SSE connection hook
│   └── lib/
│       └── api.ts            # API client
└── docker-compose.yml
```

## How It Works

### 1. Ticket Submission Flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as FastAPI
    participant BG as BackgroundTask
    participant AI as Gemini API
    participant EM as EventManager
    participant SSE as SSE Stream
    participant DB as PostgreSQL
    
    U->>FE: Submit Ticket
    FE->>API: POST /tickets
    API->>DB: INSERT (status=pending)
    API->>BG: add_task(process_ticket)
    API-->>FE: 201 Created (instant!)
    
    Note over BG,AI: Async Processing (2-5s)
    BG->>DB: UPDATE status=processing
    BG->>AI: Analyze content
    AI-->>BG: {category, urgency, sentiment, draft}
    BG->>DB: UPDATE with AI results
    BG->>EM: broadcast("ticket_update")
    EM->>SSE: Push event to all clients
    SSE-->>FE: data: {"ticket_id": "...", "status": "completed"}
    FE->>API: GET /tickets (refetch)
    API-->>FE: Updated ticket data
```

### 2. Real-Time Updates (SSE)

Instead of polling, the frontend maintains a persistent connection:

**Backend (`/events` endpoint):**
```python
@app.get("/events")
async def stream_ticket_events():
    async def event_generator():
        queue = await event_manager.connect()
        try:
            while True:
                message = await queue.get()
                yield f"data: {message}\n\n"
        except asyncio.CancelledError:
            event_manager.disconnect(queue)
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

**Frontend (`useTicketEvents` hook):**
```typescript
const eventSource = new EventSource(`${apiUrl}/events`);

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "ticket_update") {
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
    }
};
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Quick Start

```bash
# 1. Clone and navigate
cd TriageRecoveryHub

# 2. Configure environment
echo "GEMINI_API_KEY=your-actual-key-here" > backend/.env

# 3. Start all services
docker compose up --build

# 4. Access the application
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
# SSE Stream: http://localhost:8000/events
```

### Local Development

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/triage_hub"
export GEMINI_API_KEY="your-key-here"

uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/tickets` | Create ticket (returns immediately) |
| `GET` | `/tickets` | List all tickets (pagination support) |
| `GET` | `/tickets/{id}` | Get specific ticket |
| `PATCH` | `/tickets/{id}` | Update ticket fields |
| `POST` | `/tickets/{id}/resolve` | Mark ticket as resolved |
| `GET` | `/events` | **SSE stream** for real-time updates |

### Example: Create Ticket

```bash
curl -X POST http://localhost:8000/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "raw_content": "My application crashes when uploading large files over 10MB"
  }'
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "raw_content": "My application crashes when uploading large files over 10MB",
  "status": "pending",
  "category": null,
  "urgency": null,
  "sentiment_score": null,
  "draft_response": null,
  "created_at": "2026-02-04T14:30:00Z",
  "resolved": false
}
```

**SSE Event (2-5 seconds later):**
```
data: {"type": "ticket_update", "ticket_id": "550e8400-e29b-41d4-a716-446655440000", "status": "completed"}
```

## Database Schema

```mermaid
erDiagram
    TICKETS {
        UUID id PK
        TEXT raw_content
        ENUM status "pending | processing | completed | failed"
        VARCHAR category "Technical | Billing | Account | General | Spam"
        VARCHAR urgency "Low | Medium | High | Critical"
        INTEGER sentiment_score "1-10"
        TEXT draft_response
        DATETIME created_at
        BOOLEAN resolved
        DATETIME resolved_at
        VARCHAR resolved_by
    }
```

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/triage_hub
GEMINI_API_KEY=your-gemini-api-key-here
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Architecture Decisions

### Why Server-Sent Events over Polling?

| Aspect | Polling (Old) | SSE (Current) |
|--------|---------------|---------------|
| **Network Requests** | Every 3 seconds | 1 persistent connection |
| **Latency** | 0-3 second delay | Instant (<100ms) |
| **Server Load** | High (N clients × 20 req/min) | Low (N connections) |
| **Scalability** | Poor | Excellent |
| **Complexity** | Simple | Moderate |

### Why Gemini over OpenAI?

- **Cost**: Free tier available
- **Performance**: Comparable to GPT-4o-mini
- **Availability**: No quota issues during development

### Why FastAPI over Flask/Django?

- **Async Native**: Built for async/await from the ground up
- **Performance**: 2-3x faster than Flask
- **Type Safety**: Pydantic integration
- **Auto Docs**: OpenAPI/Swagger out of the box

## Performance Characteristics

- **Ticket Creation**: <50ms (database insert only)
- **AI Processing**: 2-5 seconds (Gemini API call)
- **SSE Latency**: <100ms (event broadcast to UI update)
- **Concurrent Users**: 100+ (tested with asyncio)

## Monitoring & Observability

All operations are logged with structured logging:

```python
logger.info(f"Successfully processed ticket {ticket_id}")
logger.error(f"Error calling Gemini API: {str(e)}")
```

Check logs:
```bash
docker compose logs -f backend
```

## Future Enhancements

- [ ] **Authentication**: JWT-based user auth
- [ ] **Redis**: Distributed event broadcasting for multi-worker setups
- [ ] **Metrics**: Prometheus + Grafana dashboards
- [ ] **Rate Limiting**: Per-user API quotas
- [ ] **WebSockets**: Bidirectional communication for agent chat
- [ ] **Email Notifications**: Send updates via email
- [ ] **Advanced Analytics**: Ticket trends, category distribution

## License

MIT

---

**Built with ❤️ as a demonstration of production-grade async architecture, real-time event systems, and AI integration.**
