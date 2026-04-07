from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OctagonMatchViewSet

router = DefaultRouter()
router.register(r'', OctagonMatchViewSet, basename='octagon')

urlpatterns = [
    path('', include(router.urls)),
]
