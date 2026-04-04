from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OctagonMatchViewSet, OctagonPlayerViewSet

router = DefaultRouter()
router.register(r'matches', OctagonMatchViewSet, basename='octagon-match')
router.register(r'players', OctagonPlayerViewSet, basename='octagon-player')

urlpatterns = [
    path('', include(router.urls)),
]
