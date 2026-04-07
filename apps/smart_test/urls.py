from django.urls import path
from .views import SmartTestViewSet

urlpatterns = [
    path(
        'smart-test/',
        SmartTestViewSet.as_view({
            'get': 'due_for_review',
            'post': 'update_stat'
        })
    ),
    path(
        'smart-test/start/',
        SmartTestViewSet.as_view({'post': 'start'})
    ),
    path(
        'smart-test/stats/',
        SmartTestViewSet.as_view({'get': 'stats'})
    ),
]
