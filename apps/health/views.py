from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db import connection
import redis
from django.conf import settings


class HealthCheckView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        health = {
            'status': 'ok',
            'database': 'connected',
            'redis': 'connected'
        }
        
        # Check database
        try:
            connection.ensure_connection()
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
        except Exception as e:
            health['status'] = 'degraded'
            health['database'] = f'error: {str(e)}'
        
        # Check Redis
        try:
            r = redis.from_url(settings.CACHES['default']['LOCATION'])
            r.ping()
        except Exception as e:
            health['status'] = 'degraded'
            health['redis'] = f'error: {str(e)}'
        
        status_code = status.HTTP_200_OK if health['status'] == 'ok' else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(health, status=status_code)
