from django.urls import path
from .views import (
    AdminDashboardView,
    AdminUserListAPIView,
    AdminBanUserAPIView,
    AdminUnbanUserAPIView,
    AdminQuestionListAPIView,
    AdminQuestionCreateAPIView,
    AdminQuestionDetailAPIView,
    AdminSubscriptionListAPIView,
)

urlpatterns = [
    # Dashboard
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),

    # Users
    path('users/', AdminUserListAPIView.as_view(), name='admin-users-list'),
    path('users/<int:user_id>/ban/', AdminBanUserAPIView.as_view(), name='admin-user-ban'),
    path('users/<int:user_id>/unban/', AdminUnbanUserAPIView.as_view(), name='admin-user-unban'),

    # Questions
    path('questions/', AdminQuestionListAPIView.as_view(), name='admin-questions-list'),
    path('questions/', AdminQuestionCreateAPIView.as_view(), name='admin-questions-create'),
    path('questions/<int:question_id>/', AdminQuestionDetailAPIView.as_view(), name='admin-question-detail'),

    # Subscriptions
    path('subscriptions/', AdminSubscriptionListAPIView.as_view(), name='admin-subscriptions-list'),
]
