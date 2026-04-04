from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TopicViewSet, QuestionViewSet, AnswerViewSet

router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'answers', AnswerViewSet, basename='answer')

urlpatterns = [
    path('', include(router.urls)),
]
