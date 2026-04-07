"""
User URLs
"""
from django.urls import path
from .views import (
    GetProfileView,
    UpdateProfileView,
    ChangeLanguageView,
    UserStatsView,
    DeleteAccountView
)

urlpatterns = [
    path('profile/', GetProfileView.as_view(), name='user-profile'),
    path('profile/', UpdateProfileView.as_view(), name='user-update-profile'),
    path('language/', ChangeLanguageView.as_view(), name='user-change-language'),
    path('stats/', UserStatsView.as_view(), name='user-stats'),
    path('account/', DeleteAccountView.as_view(), name='user-delete-account'),
]
