"""
Script to create demo users for testing authentication
"""
import asyncio
from app.database import AsyncSessionLocal
from app.models import User, UserRole
from app.auth import hash_password


async def create_demo_users():
    """Create demo customer and agent users"""
    async with AsyncSessionLocal() as db:
        # Check if users already exist
        from sqlalchemy import select
        
        # Create customer
        customer_email = "customer@demo.com"
        result = await db.execute(select(User).where(User.email == customer_email))
        if not result.scalar_one_or_none():
            customer = User(
                email=customer_email,
                hashed_password=hash_password("password123"),
                full_name="Demo Customer",
                role=UserRole.CUSTOMER,
                is_active=True
            )
            db.add(customer)
            print(f"✅ Created customer: {customer_email}")
        else:
            print(f"ℹ️  Customer already exists: {customer_email}")
        
        # Create agent
        agent_email = "agent@demo.com"
        result = await db.execute(select(User).where(User.email == agent_email))
        if not result.scalar_one_or_none():
            agent = User(
                email=agent_email,
                hashed_password=hash_password("password123"),
                full_name="Demo Agent",
                role=UserRole.AGENT,
                is_active=True
            )
            db.add(agent)
            print(f"✅ Created agent: {agent_email}")
        else:
            print(f"ℹ️  Agent already exists: {agent_email}")
        
        await db.commit()
        print("\n🎉 Demo users ready!")
        print("\nLogin Credentials:")
        print("  Customer: customer@demo.com / password123")
        print("  Agent: agent@demo.com / password123")


if __name__ == "__main__":
    asyncio.run(create_demo_users())
