from django.urls import path
from apps.octagon.consumers import OctagonConsumer

websocket_urlpatterns = [
    path('ws/octagon/<int:match_id>/', OctagonConsumer.as_asgi()),
]
