from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubscriptionViewSet,
    ClickPaymentViewSet,
    PaymePaymentViewSet,
    TelegramStarsViewSet,
)

router = DefaultRouter()
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')

urlpatterns = [
    path('', include(router.urls)),
    # Click payment callback
    path('subscriptions/click/callback/',
         ClickPaymentViewSet.as_view({'post': 'callback'}),
         name='click-callback'),
    # Payme payment callback (all 4 methods)
    path('subscriptions/payme/callback/',
         PaymePaymentViewSet.as_view({'post': 'callback'}),
         name='payme-callback'),
    # Telegram Stars payment
    path('subscriptions/telegram-stars/',
         TelegramStarsViewSet.as_view({'post': 'create'}),
         name='telegram-stars'),
]
