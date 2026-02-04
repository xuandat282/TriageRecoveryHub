"""Pytest configuration and fixtures for testing."""
import asyncio
import os
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool

from app.database import Base, get_db
from app.main import app
from app.models import User, UserRole
from app.auth import hash_password, create_access_token

# Test database URL
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@db:5432/triage_hub"
)

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    poolclass=NullPool,
)

# Create test session maker
TestSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Create a fresh database session for each test.
    
    Creates all tables before the test and drops them after.
    """
    # Create all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Create session
    async with TestSessionLocal() as session:
        yield session
    
    # Drop all tables
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Create a test client with database session override.
    """
    async def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_customer(db_session: AsyncSession) -> User:
    """Create a test customer user."""
    user = User(
        email="customer@test.com",
        hashed_password=hash_password("testpass123"),
        full_name="Test Customer",
        role=UserRole.CUSTOMER,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_agent(db_session: AsyncSession) -> User:
    """Create a test agent user."""
    user = User(
        email="agent@test.com",
        hashed_password=hash_password("testpass123"),
        full_name="Test Agent",
        role=UserRole.AGENT,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def customer_token(test_customer: User) -> str:
    """Generate JWT token for test customer."""
    return create_access_token(data={"sub": str(test_customer.id)})


@pytest.fixture
def agent_token(test_agent: User) -> str:
    """Generate JWT token for test agent."""
    return create_access_token(data={"sub": str(test_agent.id)})
