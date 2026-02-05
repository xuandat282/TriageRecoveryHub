"""Event manager for Server-Sent Events (SSE)."""
import asyncio
import logging
from typing import List

logger = logging.getLogger(__name__)


class EventManager:
    """
    Manages active client connections for Server-Sent Events.
    
    This class maintains a list of asyncio queues, one for each connected client.
    When an event occurs (e.g., ticket completion), it broadcasts the message
    to all active connections.
    """
    
    def __init__(self):
        self.active_connections: List[asyncio.Queue] = []

    async def connect(self) -> asyncio.Queue:
        """
        Create a new connection queue for a client.
        
        Returns:
            asyncio.Queue: A queue for sending messages to this client
        """
        # Set maxsize to prevent memory leaks if client is slow reader
        queue = asyncio.Queue(maxsize=100)
        self.active_connections.append(queue)
        logger.info(f"Client connected. Active connections: {len(self.active_connections)}")
        return queue

    def disconnect(self, queue: asyncio.Queue) -> None:
        """
        Remove a connection queue when a client disconnects.
        
        Args:
            queue: The queue to remove from active connections
        """
        if queue in self.active_connections:
            self.active_connections.remove(queue)
            logger.info(f"Client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: str) -> None:
        """
        Send a message to all active client connections.
        
        Args:
            message: The message to broadcast (typically JSON string)
        """
        for queue in self.active_connections:
            try:
                # preventing blocking if queue is full, drop message if necessary or use put_nowait
                if not queue.full():
                    queue.put_nowait(message)
                else:
                    logger.warning("Client queue full, dropping message")
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")


# Global event manager instance
event_manager = EventManager()
