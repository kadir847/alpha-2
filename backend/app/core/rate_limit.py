import time
from collections import defaultdict
from typing import Callable

import redis
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.memory: dict[str, list[float]] = defaultdict(list)
        self.redis_client = None
        if settings.redis_url:
            try:
                self.redis_client = redis.from_url(settings.redis_url, decode_responses=True)
                self.redis_client.ping()
            except redis.RedisError:
                self.redis_client = None

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.url.path == "/health":
            return await call_next(request)

        key = request.client.host if request.client else "unknown"
        limit = settings.rate_limit_per_minute

        if self.redis_client:
            bucket = f"rate:{key}:{int(time.time() // 60)}"
            count = self.redis_client.incr(bucket)
            self.redis_client.expire(bucket, 65)
            if count > limit:
                return Response("Rate limit exceeded", status_code=429)
        else:
            now = time.time()
            window = now - 60
            self.memory[key] = [entry for entry in self.memory[key] if entry > window]
            if len(self.memory[key]) >= limit:
                return Response("Rate limit exceeded", status_code=429)
            self.memory[key].append(now)

        return await call_next(request)

