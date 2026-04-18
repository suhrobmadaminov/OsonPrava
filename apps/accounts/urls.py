"""
Auth URLs
"""
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    ResendVerifyView,
    RefreshView,
    LogoutView,
    MeView,
)

urlpatterns = [
    # Email/Password Auth
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth-verify-email'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
    path('resend-verify/', ResendVerifyView.as_view(), name='auth-resend-verify'),
    
    # Token Management
    path('refresh/', RefreshView.as_view(), name='auth-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', MeView.as_view(), name='auth-me'),
    
]
