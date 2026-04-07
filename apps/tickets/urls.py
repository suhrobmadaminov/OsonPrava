from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TicketViewSet, TicketQuestionViewSet

router = DefaultRouter()
router.register(r'tickets', TicketViewSet, basename='ticket')
router.register(r'ticket-questions', TicketQuestionViewSet, basename='ticket-question')

urlpatterns = [
    path('', include(router.urls)),
]
