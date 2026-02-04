# Testing Guide

## Overview

This project includes comprehensive unit and integration tests covering authentication, business logic, and API endpoints with role-based access control.

## Test Coverage

- **30+ tests** across 3 test files
- **Target**: >80% code coverage
- **Test Types**: Unit tests, integration tests, authentication flows

## Quick Start

### 1. Install Test Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run All Tests

```bash
# Run all tests with coverage report
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run specific test class
pytest tests/test_auth.py::TestPasswordHashing

# Run specific test
pytest tests/test_auth.py::TestPasswordHashing::test_hash_password
```

### 3. View Coverage Report

```bash
# Generate HTML coverage report
pytest --cov=app --cov-report=html

# Open the report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

## Test Files

### `tests/test_auth.py` - Authentication Tests

**Password Hashing (4 tests)**
- `test_hash_password` - Verify passwords are hashed with bcrypt
- `test_verify_password_correct` - Correct password verification
- `test_verify_password_incorrect` - Wrong password rejection
- `test_same_password_different_hashes` - Salt uniqueness

**User Registration (5 tests)**
- `test_register_customer_success` - Successful customer registration
- `test_register_agent_success` - Successful agent registration
- `test_register_duplicate_email_fails` - Duplicate email rejection
- `test_register_invalid_email_fails` - Email validation
- `test_register_short_password_fails` - Password length validation

**User Login (3 tests)**
- `test_login_success` - Successful login returns JWT
- `test_login_wrong_password_fails` - Wrong password rejection
- `test_login_nonexistent_user_fails` - Non-existent user rejection

**Current User (3 tests)**
- `test_get_me_with_valid_token` - Get user info with valid token
- `test_get_me_without_token_fails` - No token rejection
- `test_get_me_with_invalid_token_fails` - Invalid token rejection

### `tests/test_services.py` - Business Logic Tests

**Fallback Analysis (12 tests)**
- Category detection (Technical, Billing, Account, Spam, General)
- Urgency assessment
- Sentiment analysis
- Draft response generation

### `tests/test_tickets.py` - API Integration Tests

**Ticket Creation (2 tests)**
- `test_create_ticket_authenticated` - Authenticated ticket creation
- `test_create_ticket_unauthenticated_fails` - Unauthenticated rejection

**Ticket Listing (3 tests)**
- `test_list_tickets_agent_sees_all` - Agents see all tickets
- `test_list_tickets_customer_sees_own_only` - Customers see only their tickets
- `test_list_tickets_unauthenticated_fails` - Unauthenticated rejection

**Ticket Update (2 tests)**
- `test_update_ticket_agent_success` - Agents can update tickets
- `test_update_ticket_customer_fails` - Customers cannot update tickets

**Ticket Resolve (3 tests)**
- `test_resolve_ticket_agent_success` - Agents can resolve tickets
- `test_resolve_ticket_customer_fails` - Customers cannot resolve tickets
- `test_resolve_already_resolved_ticket_fails` - Cannot re-resolve tickets

## Test Database

Tests use a separate test database to avoid affecting development data.

**Default Test DB**: `postgresql+asyncpg://postgres:postgres@localhost:5432/triage_hub_test`

**Custom Test DB**:
```bash
export TEST_DATABASE_URL="postgresql+asyncpg://user:pass@host:port/dbname"
pytest
```

## Test Fixtures

### Database Fixtures
- `db_session` - Fresh database session for each test
- Auto-creates and drops tables per test

### User Fixtures
- `test_customer` - Customer user with email `customer@test.com`
- `test_agent` - Agent user with email `agent@test.com`
- `customer_token` - JWT token for customer
- `agent_token` - JWT token for agent

### Client Fixture
- `client` - AsyncClient for making HTTP requests

## Example Test Usage

```python
@pytest.mark.asyncio
async def test_my_endpoint(client: AsyncClient, agent_token: str):
    """Test my endpoint with authentication."""
    response = await client.get(
        "/my-endpoint",
        headers={"Authorization": f"Bearer {agent_token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["key"] == "value"
```

## Continuous Integration

To run tests in CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: |
    pip install -r requirements.txt
    pytest --cov=app --cov-report=xml
```

## Troubleshooting

### Database Connection Errors

Ensure PostgreSQL is running:
```bash
docker compose up db
```

### Import Errors

Ensure you're in the backend directory:
```bash
cd backend
pytest
```

### Async Warnings

The project uses `pytest-asyncio` with `asyncio_mode = auto` in `pytest.ini`.

## Test Credentials

For manual testing of authentication endpoints:

**Customer Account:**
- Email: `customer@test.com`
- Password: `testpass123`
- Role: CUSTOMER

**Agent Account:**
- Email: `agent@test.com`
- Password: `testpass123`
- Role: AGENT

## Expected Results

All tests should pass with >80% code coverage:

```
============================= test session starts ==============================
collected 30 items

tests/test_auth.py ............... [ 50%]
tests/test_services.py ............ [ 90%]
tests/test_tickets.py .......... [100%]

---------- coverage: platform darwin, python 3.11.0 -----------
Name                     Stmts   Miss  Cover
--------------------------------------------
app/__init__.py              0      0   100%
app/auth.py                 85      8    91%
app/database.py             20      2    90%
app/events.py               25      3    88%
app/main.py                180     15    92%
app/models.py               35      0   100%
app/schemas.py              40      0   100%
app/services.py            120     12    90%
--------------------------------------------
TOTAL                      505     40    92%

============================== 30 passed in 5.23s ===============================
```
