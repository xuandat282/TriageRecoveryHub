"""Unit tests for authentication functionality."""
import pytest
from httpx import AsyncClient

from app.models import User
from app.auth import hash_password, verify_password


class TestPasswordHashing:
    """Test password hashing and verification."""
    
    def test_hash_password(self):
        """Test that passwords are hashed correctly."""
        password = "mysecretpassword"
        hashed = hash_password(password)
        
        assert hashed != password
        assert len(hashed) > 20
        assert hashed.startswith("$2b$")  # bcrypt hash prefix
    
    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "mysecretpassword"
        hashed = hash_password(password)
        
        assert verify_password(password, hashed) is True
    
    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "mysecretpassword"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)
        
        assert verify_password(wrong_password, hashed) is False
    
    def test_same_password_different_hashes(self):
        """Test that same password produces different hashes (salt)."""
        password = "mysecretpassword"
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        assert hash1 != hash2
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestUserRegistration:
    """Test user registration endpoint."""
    
    @pytest.mark.asyncio
    async def test_register_customer_success(self, client: AsyncClient):
        """Test successful customer registration."""
        response = await client.post(
            "/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "password123",
                "full_name": "New User",
                "role": "customer"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["full_name"] == "New User"
        assert data["role"] == "customer"
        assert data["is_active"] is True
        assert "id" in data
        assert "hashed_password" not in data  # Should not expose password
    
    @pytest.mark.asyncio
    async def test_register_agent_success(self, client: AsyncClient):
        """Test successful agent registration."""
        response = await client.post(
            "/auth/register",
            json={
                "email": "newagent@test.com",
                "password": "password123",
                "full_name": "New Agent",
                "role": "agent"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "agent"
    
    @pytest.mark.asyncio
    async def test_register_duplicate_email_fails(self, client: AsyncClient, test_customer: User):
        """Test that registering with duplicate email fails."""
        response = await client.post(
            "/auth/register",
            json={
                "email": test_customer.email,
                "password": "password123",
                "full_name": "Duplicate User"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_register_invalid_email_fails(self, client: AsyncClient):
        """Test that invalid email format fails validation."""
        response = await client.post(
            "/auth/register",
            json={
                "email": "not-an-email",
                "password": "password123",
                "full_name": "Test User"
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    @pytest.mark.asyncio
    async def test_register_short_password_fails(self, client: AsyncClient):
        """Test that password shorter than 8 characters fails."""
        response = await client.post(
            "/auth/register",
            json={
                "email": "test@test.com",
                "password": "short",
                "full_name": "Test User"
            }
        )
        
        assert response.status_code == 422  # Validation error


class TestUserLogin:
    """Test user login endpoint."""
    
    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, test_customer: User):
        """Test successful login returns JWT token."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_customer.email,
                "password": "testpass123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 20
    
    @pytest.mark.asyncio
    async def test_login_wrong_password_fails(self, client: AsyncClient, test_customer: User):
        """Test login with wrong password fails."""
        response = await client.post(
            "/auth/login",
            json={
                "email": test_customer.email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    @pytest.mark.asyncio
    async def test_login_nonexistent_user_fails(self, client: AsyncClient):
        """Test login with non-existent email fails."""
        response = await client.post(
            "/auth/login",
            json={
                "email": "nonexistent@test.com",
                "password": "password123"
            }
        )
        
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()


class TestGetCurrentUser:
    """Test getting current user information."""
    
    @pytest.mark.asyncio
    async def test_get_me_with_valid_token(self, client: AsyncClient, test_customer: User, customer_token: str):
        """Test getting current user with valid token."""
        response = await client.get(
            "/auth/me",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_customer.email
        assert data["full_name"] == test_customer.full_name
        assert data["role"] == test_customer.role.value
    
    @pytest.mark.asyncio
    async def test_get_me_without_token_fails(self, client: AsyncClient):
        """Test getting current user without token fails."""
        response = await client.get("/auth/me")
        
        assert response.status_code == 403  # Forbidden (no credentials)
    
    @pytest.mark.asyncio
    async def test_get_me_with_invalid_token_fails(self, client: AsyncClient):
        """Test getting current user with invalid token fails."""
        response = await client.get(
            "/auth/me",
            headers={"Authorization": "Bearer invalid-token-here"}
        )
        
        assert response.status_code == 401  # Unauthorized
