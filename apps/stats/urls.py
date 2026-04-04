from django.urls import path
from .views import UserStatsView

urlpatterns = [
    path('user-stats/', UserStatsView.as_view(), name='user-stats'),
]
