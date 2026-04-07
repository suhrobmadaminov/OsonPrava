from django.urls import path
from .views import LeaderboardViewSet

viewset = LeaderboardViewSet.as_view({
    'get': 'list',
})

urlpatterns = [
    path('', viewset, name='leaderboard-list'),
    path('weekly/', LeaderboardViewSet.as_view({'get': 'weekly'}), name='leaderboard-weekly'),
    path('octagon/', LeaderboardViewSet.as_view({'get': 'octagon'}), name='leaderboard-octagon'),
]
