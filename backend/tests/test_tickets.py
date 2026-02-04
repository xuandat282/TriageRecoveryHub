"""Integration tests for ticket endpoints with authentication."""
import pytest
from httpx import AsyncClient

from app.models import User, Ticket


class TestTicketCreation:
    """Test ticket creation endpoint."""
    
    @pytest.mark.asyncio
    async def test_create_ticket_authenticated(self, client: AsyncClient, customer_token: str):
        """Test creating a ticket with authentication."""
        response = await client.post(
            "/tickets",
            json={"raw_content": "My application is not working properly"},
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["raw_content"] == "My application is not working properly"
        assert data["status"] == "pending"
        assert "id" in data
        assert data["created_by"] is not None
    
    @pytest.mark.asyncio
    async def test_create_ticket_unauthenticated_fails(self, client: AsyncClient):
        """Test creating a ticket without authentication fails."""
        response = await client.post(
            "/tickets",
            json={"raw_content": "Test ticket"}
        )
        
        assert response.status_code == 403  # Forbidden


class TestTicketListing:
    """Test ticket listing with role-based filtering."""
    
    @pytest.mark.asyncio
    async def test_list_tickets_agent_sees_all(
        self,
        client: AsyncClient,
        db_session,
        test_customer: User,
        test_agent: User,
        agent_token: str
    ):
        """Test that agents see all tickets."""
        # Create tickets from different users
        customer_ticket = Ticket(
            raw_content="Customer ticket",
            created_by=test_customer.id
        )
        agent_ticket = Ticket(
            raw_content="Agent ticket",
            created_by=test_agent.id
        )
        db_session.add(customer_ticket)
        db_session.add(agent_ticket)
        await db_session.commit()
        
        # Agent should see both tickets
        response = await client.get(
            "/tickets",
            headers={"Authorization": f"Bearer {agent_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["tickets"]) == 2
    
    @pytest.mark.asyncio
    async def test_list_tickets_customer_sees_own_only(
        self,
        client: AsyncClient,
        db_session,
        test_customer: User,
        test_agent: User,
        customer_token: str
    ):
        """Test that customers only see their own tickets."""
        # Create tickets from different users
        customer_ticket = Ticket(
            raw_content="Customer ticket",
            created_by=test_customer.id
        )
        agent_ticket = Ticket(
            raw_content="Agent ticket",
            created_by=test_agent.id
        )
        db_session.add(customer_ticket)
        db_session.add(agent_ticket)
        await db_session.commit()
        
        # Customer should only see their own ticket
        response = await client.get(
            "/tickets",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert len(data["tickets"]) == 1
        assert data["tickets"][0]["raw_content"] == "Customer ticket"
    
    @pytest.mark.asyncio
    async def test_list_tickets_unauthenticated_fails(self, client: AsyncClient):
        """Test listing tickets without authentication fails."""
        response = await client.get("/tickets")
        
        assert response.status_code == 403


class TestTicketUpdate:
    """Test ticket update endpoint."""
    
    @pytest.mark.asyncio
    async def test_update_ticket_agent_success(
        self,
        client: AsyncClient,
        db_session,
        test_customer: User,
        agent_token: str
    ):
        """Test that agents can update tickets."""
        # Create a ticket
        ticket = Ticket(
            raw_content="Test ticket",
            created_by=test_customer.id,
            draft_response="Original draft"
        )
        db_session.add(ticket)
        await db_session.commit()
        await db_session.refresh(ticket)
        
        # Agent updates the ticket
        response = await client.patch(
            f"/tickets/{ticket.id}",
            json={"draft_response": "Updated draft response"},
            headers={"Authorization": f"Bearer {agent_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["draft_response"] == "Updated draft response"
    
    @pytest.mark.asyncio
    async def test_update_ticket_customer_fails(
        self,
        client: AsyncClient,
        db_session,
        test_customer: User,
        customer_token: str
    ):
        """Test that customers cannot update tickets."""
        # Create a ticket
        ticket = Ticket(
            raw_content="Test ticket",
            created_by=test_customer.id
        )
        db_session.add(ticket)
        await db_session.commit()
        await db_session.refresh(ticket)
        
        # Customer tries to update
        response = await client.patch(
            f"/tickets/{ticket.id}",
            json={"draft_response": "Trying to update"},
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 403  # Forbidden


class TestTicketResolve:
    """Test ticket resolve endpoint."""
    
    @pytest.mark.asyncio
    async def test_resolve_ticket_agent_success(
        self,
        client: AsyncClient,
        db_session,
        test_customer: User,
        test_agent: User,
        agent_token: str
    ):
        """Test that agents can resolve tickets."""
        # Create a ticket
        ticket = Ticket(
            raw_content="Test ticket",
            created_by=test_customer.id
        )
        db_session.add(ticket)
        await db_session.commit()
        await db_session.refresh(ticket)
        
        # Agent resolves the ticket
        response = await client.post(
            f"/tickets/{ticket.id}/resolve",
            headers={"Authorization": f"Bearer {agent_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["resolved"] is True
        assert data["resolved_at"] is not None
        assert data["resolved_by"] == test_agent.email
    
    @pytest.mark.asyncio
    async def test_resolve_ticket_customer_fails(
        self,
        client: AsyncClient,
        db_session,
        test_customer: User,
        customer_token: str
    ):
        """Test that customers cannot resolve tickets."""
        # Create a ticket
        ticket = Ticket(
            raw_content="Test ticket",
            created_by=test_customer.id
        )
        db_session.add(ticket)
        await db_session.commit()
        await db_session.refresh(ticket)
        
        # Customer tries to resolve
        response = await client.post(
            f"/tickets/{ticket.id}/resolve",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        
        assert response.status_code == 403  # Forbidden
    
    @pytest.mark.asyncio
    async def test_resolve_already_resolved_ticket_fails(
        self,
        client: AsyncClient,
        db_session,
        test_customer: User,
        agent_token: str
    ):
        """Test that resolving an already resolved ticket fails."""
        # Create a resolved ticket
        ticket = Ticket(
            raw_content="Test ticket",
            created_by=test_customer.id,
            resolved=True
        )
        db_session.add(ticket)
        await db_session.commit()
        await db_session.refresh(ticket)
        
        # Try to resolve again
        response = await client.post(
            f"/tickets/{ticket.id}/resolve",
            headers={"Authorization": f"Bearer {agent_token}"}
        )
        
        assert response.status_code == 400
        assert "already resolved" in response.json()["detail"].lower()
