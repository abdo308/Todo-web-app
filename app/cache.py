from functools import wraps
from typing import Optional, Any
import hashlib
import json
from app.redis_client import redis_client

def cache_key(*args, **kwargs) -> str:
    """Generate cache key from function arguments"""
    key_data = {
        'args': args,
        'kwargs': kwargs
    }
    key_string = json.dumps(key_data, sort_keys=True, default=str)
    return hashlib.md5(key_string.encode()).hexdigest()

def cache_result(ttl: int = 300, key_prefix: str = "cache"):
    """Decorator to cache function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not redis_client.is_connected():
                # Redis not available, execute function normally
                return await func(*args, **kwargs)
            
            # Generate cache key
            cache_k = f"{key_prefix}:{func.__name__}:{cache_key(*args, **kwargs)}"
            
            # Try to get from cache
            cached_result = redis_client.get_cache(cache_k)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.set_cache(cache_k, result, ttl)
            
            return result
        return wrapper
    return decorator

def invalidate_cache_pattern(pattern: str):
    """Invalidate cache entries matching pattern"""
    if not redis_client.is_connected():
        return
    
    try:
        keys = redis_client.client.keys(pattern)
        if keys:
            redis_client.client.delete(*keys)
    except Exception as e:
        print(f"Cache invalidation error: {e}")

def rate_limit(max_requests: int = 100, window: int = 3600):
    """Rate limiting decorator"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not redis_client.is_connected():
                # Redis not available, skip rate limiting
                return await func(*args, **kwargs)
            
            # Extract user info from kwargs (assumes current_user is passed)
            current_user = kwargs.get('current_user')
            if not current_user:
                return await func(*args, **kwargs)
            
            # Rate limit key
            rate_key = f"rate_limit:{current_user.id}:{func.__name__}"
            current_requests = redis_client.increment_counter(rate_key, window)
            
            if current_requests > max_requests:
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Max {max_requests} requests per hour."
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator