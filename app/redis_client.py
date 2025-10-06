import redis
import json
import os
from typing import Optional, Any
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisClient:
    def __init__(self):
        self.client = None
        self._connect()
    
    def _connect(self):
        """Connect to Redis with error handling"""
        try:
            self.client = redis.from_url(REDIS_URL, decode_responses=True)
            # Test connection
            self.client.ping()
            print("✅ Redis connected successfully")
        except redis.ConnectionError:
            print("⚠️ Redis not available, caching disabled")
            self.client = None
        except Exception as e:
            print(f"❌ Redis connection error: {e}")
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if Redis is available"""
        return self.client is not None
    
    def set_cache(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set cache with TTL (default 5 minutes)"""
        if not self.is_connected():
            return False
        
        try:
            serialized_value = json.dumps(value, default=str)
            return self.client.setex(key, ttl, serialized_value)
        except Exception as e:
            print(f"Cache set error: {e}")
            return False
    
    def get_cache(self, key: str) -> Optional[Any]:
        """Get cached value"""
        if not self.is_connected():
            return None
        
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            print(f"Cache get error: {e}")
            return None
    
    def delete_cache(self, key: str) -> bool:
        """Delete cached value"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.client.delete(key))
        except Exception as e:
            print(f"Cache delete error: {e}")
            return False
    
    def increment_counter(self, key: str, ttl: int = 3600) -> int:
        """Increment counter for rate limiting"""
        if not self.is_connected():
            return 0
        
        try:
            pipe = self.client.pipeline()
            pipe.incr(key)
            pipe.expire(key, ttl)
            result = pipe.execute()
            return result[0]
        except Exception as e:
            print(f"Counter increment error: {e}")
            return 0

# Global Redis client instance
redis_client = RedisClient()