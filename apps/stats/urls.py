from django.urls import path
from .views import (
    UserStatsView,
    StatsOverviewView,
    StatsWeeklyView,
    StatsTopicsView,
    StatsStreakView,
)

urlpatterns = [
    path('user-stats/', UserStatsView.as_view(), name='user-stats'),
    path('stats/overview/', StatsOverviewView.as_view(), name='stats-overview'),
    path('stats/weekly/', StatsWeeklyView.as_view(), name='stats-weekly'),
    path('stats/topics/', StatsTopicsView.as_view(), name='stats-topics'),
    path('stats/streak/', StatsStreakView.as_view(), name='stats-streak'),
]
