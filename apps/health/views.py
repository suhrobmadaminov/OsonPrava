from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db import connection
from django.conf import settings
import redis
import time

# Server start time for uptime calculation
_SERVER_START_TIME = time.time()


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        db_status = 'up'
        db_latency_ms = None
        redis_status = 'up'
        redis_latency_ms = None

        # Check database
        try:
            start = time.time()
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            db_latency_ms = round((time.time() - start) * 1000)
        except Exception:
            db_status = 'down'

        # Check Redis
        try:
            redis_url = getattr(settings, 'REDIS_URL', None)
            if redis_url:
                start = time.time()
                r = redis.from_url(redis_url)
                r.ping()
                redis_latency_ms = round((time.time() - start) * 1000)
            else:
                redis_status = 'down'
        except Exception:
            redis_status = 'down'

        # Determine overall status
        down_count = 0
        if db_status == 'down':
            down_count += 1
        if redis_status == 'down':
            down_count += 1

        if down_count == 0:
            overall_status = 'ok'
        elif down_count == 1:
            overall_status = 'degraded'
        else:
            overall_status = 'critical'

        uptime = round(time.time() - _SERVER_START_TIME)

        health = {
            'status': overall_status,
            'uptime': uptime,
            'database': {
                'status': db_status,
                'latency_ms': db_latency_ms,
            },
            'redis': {
                'status': redis_status,
                'latency_ms': redis_latency_ms,
            },
        }

        # Railway health check uchun har doim 200 qaytaramiz
        # DB/Redis holati faqat monitoring uchun
        return Response(health, status=status.HTTP_200_OK)
