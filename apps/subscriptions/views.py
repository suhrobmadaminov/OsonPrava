import logging
from decimal import Decimal

from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .models import Subscription, SubscriptionPlan, SubStatus, PaymentProvider
from .serializers import (
    SubscriptionSerializer,
    SubscriptionCreateSerializer,
    SubscriptionPlanSerializer,
    CreateSubscriptionSerializer,
    ClickCallbackSerializer,
    PaymeCallbackSerializer,
    TelegramStarsSerializer,
)

logger = logging.getLogger(__name__)

# Plan pricing configuration (UZS)
PLAN_PRICING = {
    'MONTHLY': {
        'price': 29900,
        'duration_days': 30,
    },
    'QUARTERLY': {
        'price': 79900,
        'duration_days': 90,
    },
    'YEARLY': {
        'price': 249900,
        'duration_days': 365,
    },
    'LIFETIME': {
        'price': 499900,
        'duration_days': 36500,
    },
}


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current active subscription."""
        subscription = Subscription.objects.filter(
            user=request.user,
            status='ACTIVE',
            expires_at__gt=timezone.now()
        ).first()

        if subscription:
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        return Response({'detail': 'No active subscription'}, status=404)

    @action(detail=False, methods=['get'])
    def plans(self, request):
        """Return plan list with pricing."""
        plans = []
        for plan_key, plan_info in PLAN_PRICING.items():
            plans.append({
                'plan': plan_key,
                'plan_display': SubscriptionPlan(plan_key).label,
                'price': plan_info['price'],
                'duration_days': plan_info['duration_days'],
                'currency': 'UZS',
            })
        serializer = SubscriptionPlanSerializer(plans, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='create')
    def create_sub(self, request):
        """Create a new subscription (initiates payment flow)."""
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = serializer.validated_data['plan']
        payment_provider = serializer.validated_data['payment_provider']

        plan_info = PLAN_PRICING[plan]
        price = plan_info['price']
        duration_days = plan_info['duration_days']

        now = timezone.now()
        expires_at = now + timezone.timedelta(days=duration_days)

        # Create subscription record in PENDING status
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            status=SubStatus.ACTIVE,
            starts_at=now,
            expires_at=expires_at,
            payment_provider=payment_provider,
            amount=price,
            currency='UZS',
        )

        response_data = {
            'subscription_id': subscription.id,
            'plan': plan,
            'amount': price,
            'currency': 'UZS',
            'expires_at': expires_at.isoformat(),
            'payment_provider': payment_provider,
            'message': f'Subscription created. Proceed with {payment_provider} payment of {price} UZS.',
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='status')
    def subscription_status(self, request):
        """Get current active subscription status."""
        subscription = Subscription.objects.filter(
            user=request.user,
            status=SubStatus.ACTIVE,
            expires_at__gt=timezone.now()
        ).first()

        # Try cache first
        cached_data = cache.get(f'subscription:status:{request.user.id}')
        if cached_data and not subscription:
            return Response(cached_data)

        if subscription:
            serializer = self.get_serializer(subscription)
            subscription_data = serializer.data

            # Cache the subscription data
            ttl = max(int((subscription.expires_at - timezone.now()).total_seconds()), 60)
            cache.set(
                f'subscription:status:{request.user.id}',
                subscription_data,
                ttl
            )

            return Response(subscription_data)

        return Response({'detail': 'No active subscription'}, status=404)


class ClickPaymentViewSet(ViewSet):
    """Click payment callback handler."""
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def callback(self, request):
        """Handle Click payment callback."""
        serializer = ClickCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction_id = serializer.validated_data['transaction_id']
        callback_status = serializer.validated_data['status']
        amount = serializer.validated_data['amount']
        user_id = serializer.validated_data.get('user_id')

        # If user_id not in payload, try to find subscription by amount
        if user_id:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            user = request.user if request.user.is_authenticated else None

        if callback_status in ('SUCCESS', 'success', '2', 2):
            # Find the pending subscription
            subscription = Subscription.objects.filter(
                user=user,
                amount=amount,
                payment_provider=PaymentProvider.CLICK,
            ).order_by('-created_at').first()

            if subscription:
                subscription.payment_id = transaction_id
                subscription.status = SubStatus.ACTIVE
                subscription.save()

                # Activate premium
                user = subscription.user
                user.is_premium = True
                user.role = 'PREMIUM'
                user.premium_expires_at = subscription.expires_at
                user.save()

                # Cache subscription status
                subscription_data = SubscriptionSerializer(subscription).data
                ttl = max(int((subscription.expires_at - timezone.now()).total_seconds()), 60)
                cache.set(
                    f'subscription:status:{user.id}',
                    subscription_data,
                    ttl
                )

                return Response({
                    'status': 'success',
                    'message': 'Subscription activated successfully',
                    'subscription_id': subscription.id,
                })

            return Response(
                {'error': 'Subscription not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        elif callback_status in ('CANCEL', 'cancel', '1', 1, 'FAILED', 'failed'):
            return Response({
                'status': 'cancelled',
                'message': 'Payment was cancelled or failed',
            })

        return Response(
            {'error': 'Invalid callback status'},
            status=status.HTTP_400_BAD_REQUEST
        )


class PaymePaymentViewSet(ViewSet):
    """Payme payment callback handler implementing all 4 required methods."""
    permission_classes = [permissions.AllowAny]

    def _find_subscription_by_amount(self, amount, user_id=None):
        """Find a subscription matching the amount (amount is in tyiyn, so divide by 100)."""
        amount_uzs = amount // 100  # Convert tyiyn to UZS

        if user_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user = User.objects.get(id=user_id)
                return Subscription.objects.filter(
                    user=user,
                    amount=amount_uzs,
                    payment_provider=PaymentProvider.PAYME,
                ).order_by('-created_at').first()
            except User.DoesNotExist:
                return None
        else:
            return Subscription.objects.filter(
                amount=amount_uzs,
                payment_provider=PaymentProvider.PAYME,
            ).order_by('-created_at').first()

    @action(detail=False, methods=['post'])
    def callback(self, request):
        """Handle Payme payment callback. Routes to appropriate method handler."""
        serializer = PaymeCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        method = serializer.validated_data['method']
        payme_id = serializer.validated_data['id']
        params = serializer.validated_data['params']

        handlers = {
            'CheckPerformTransaction': self._check_perform_transaction,
            'CreateTransaction': self._create_transaction,
            'PerformTransaction': self._perform_transaction,
            'CancelTransaction': self._cancel_transaction,
        }

        handler = handlers.get(method)
        if handler:
            return handler(payme_id, params)

        return Response({
            'result': {
                'error': {
                    'code': -32601,
                    'message': 'Method not found',
                }
            }
        }, status=status.HTTP_400_BAD_REQUEST)

    def _check_perform_transaction(self, payme_id, params):
        """
        CheckPerformTransaction - Validate subscription and amount.
        Verifies that the transaction can be performed.
        """
        amount = params.get('amount', 0)
        account = params.get('account', {})
        user_id = account.get('user_id')

        amount_uzs = amount // 100  # Convert tyiyn to UZS

        # Validate amount matches a plan
        valid_amounts = [info['price'] for info in PLAN_PRICING.values()]
        if amount_uzs not in valid_amounts:
            return Response({
                'result': {
                    'error': {
                        'code': -31001,
                        'message': 'Invalid amount',
                    }
                }
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find matching subscription
        subscription = self._find_subscription_by_amount(amount, user_id)
        if not subscription:
            return Response({
                'result': {
                    'error': {
                        'code': -31050,
                        'message': 'Subscription not found',
                    }
                }
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'result': {
                'allow': True,
                'detail': {
                    'subscription_id': subscription.id,
                    'plan': subscription.plan,
                    'amount': amount,
                }
            }
        })

    def _create_transaction(self, payme_id, params):
        """
        CreateTransaction - Save payment ID and create the transaction record.
        """
        amount = params.get('amount', 0)
        account = params.get('account', {})
        user_id = account.get('user_id')
        payme_transaction_id = params.get('payme_transaction_id')

        subscription = self._find_subscription_by_amount(amount, user_id)
        if not subscription:
            return Response({
                'result': {
                    'error': {
                        'code': -31050,
                        'message': 'Subscription not found',
                    }
                }
            }, status=status.HTTP_404_NOT_FOUND)

        # Save payment ID
        subscription.payment_id = payme_transaction_id or payme_id
        subscription.save()

        create_time = int(timezone.now().timestamp() * 1000)  # milliseconds

        return Response({
            'result': {
                'create_time': create_time,
                'transaction': payme_id,
            }
        })

    def _perform_transaction(self, payme_id, params):
        """
        PerformTransaction - Activate premium status for the user.
        """
        account = params.get('account', {})
        user_id = account.get('user_id')
        amount = params.get('amount', 0)

        subscription = self._find_subscription_by_amount(amount, user_id)
        if not subscription:
            return Response({
                'result': {
                    'error': {
                        'code': -31050,
                        'message': 'Subscription not found',
                    }
                }
            }, status=status.HTTP_404_NOT_FOUND)

        user = subscription.user

        # Activate premium
        user.is_premium = True
        user.role = 'PREMIUM'
        user.premium_expires_at = subscription.expires_at
        user.save()

        # Mark subscription as active with payment confirmed
        subscription.status = SubStatus.ACTIVE
        subscription.save()

        # Cache subscription status
        subscription_data = SubscriptionSerializer(subscription).data
        ttl = max(int((subscription.expires_at - timezone.now()).total_seconds()), 60)
        cache.set(
            f'subscription:status:{user.id}',
            subscription_data,
            ttl
        )

        perform_time = int(timezone.now().timestamp() * 1000)  # milliseconds

        return Response({
            'result': {
                'perform_time': perform_time,
                'transaction': payme_id,
            }
        })

    def _cancel_transaction(self, payme_id, params):
        """
        CancelTransaction - Deactivate premium status for the user.
        """
        reason = params.get('reason', 1)

        # Find subscription by payment_id
        subscription = Subscription.objects.filter(
            payment_id=payme_id,
            payment_provider=PaymentProvider.PAYME,
        ).first()

        if subscription:
            user = subscription.user

            # Deactivate premium
            user.role = 'USER'
            user.is_premium = False
            user.premium_expires_at = None
            user.save()

            # Update subscription status
            subscription.status = SubStatus.CANCELLED
            subscription.save()

            # Invalidate cache
            cache.delete(f'subscription:status:{user.id}')

            cancel_time = int(timezone.now().timestamp() * 1000)  # milliseconds

            return Response({
                'result': {
                    'cancel_time': cancel_time,
                    'transaction': payme_id,
                    'state': 2,  # Cancelled state per Payme spec
                }
            })

        return Response({
            'result': {
                'error': {
                    'code': -31008,
                    'message': 'Transaction not found',
                }
            }
        }, status=status.HTTP_404_NOT_FOUND)


class TelegramStarsViewSet(ViewSet):
    """Telegram Stars payment handler."""
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def create(self, request):
        """Handle Telegram Stars payment."""
        serializer = TelegramStarsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        plan = serializer.validated_data['plan']
        telegram_payment_charge_id = serializer.validated_data.get('telegram_payment_charge_id')

        plan_info = PLAN_PRICING[plan]
        price = plan_info['price']
        duration_days = plan_info['duration_days']

        now = timezone.now()
        expires_at = now + timezone.timedelta(days=duration_days)

        # Create subscription
        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            status=SubStatus.ACTIVE,
            starts_at=now,
            expires_at=expires_at,
            payment_provider=PaymentProvider.TELEGRAM_STARS,
            payment_id=telegram_payment_charge_id,
            amount=price,
            currency='UZS',
        )

        # Activate premium
        user = request.user
        user.is_premium = True
        user.role = 'PREMIUM'
        user.premium_expires_at = expires_at
        user.save()

        # Cache subscription status
        subscription_data = SubscriptionSerializer(subscription).data
        ttl = max(int((expires_at - now).total_seconds()), 60)
        cache.set(
            f'subscription:status:{user.id}',
            subscription_data,
            ttl
        )

        return Response({
            'subscription_id': subscription.id,
            'plan': plan,
            'amount': price,
            'currency': 'UZS',
            'expires_at': expires_at.isoformat(),
            'message': 'Subscription activated via Telegram Stars',
        }, status=status.HTTP_201_CREATED)
