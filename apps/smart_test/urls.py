from django.urls import path
from .views import SmartTestViewSet

urlpatterns = [
    path('smart-test/', SmartTestViewSet.as_view({'get': 'due_for_review', 'post': 'update_stat'})),
]
