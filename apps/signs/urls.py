from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoadSignViewSet

router = DefaultRouter()
router.register(r'signs', RoadSignViewSet, basename='sign')

urlpatterns = [
    path('', include(router.urls)),
]
