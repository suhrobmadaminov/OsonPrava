from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestSessionViewSet, TestAnswerViewSet

router = DefaultRouter()
router.register(r'test-sessions', TestSessionViewSet, basename='test-session')
router.register(r'test-answers', TestAnswerViewSet, basename='test-answer')

urlpatterns = [
    path('', include(router.urls)),
]
