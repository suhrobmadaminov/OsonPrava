import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import { SubscriptionPlan, PaymentProvider } from '@prisma/client';
import Redis from 'ioredis';

interface CreateSubscriptionDto {
  plan: SubscriptionPlan;
  provider: PaymentProvider;
}

const PLAN_PRICES: Record<SubscriptionPlan, { amount: number; durationDays: number }> = {
  MONTHLY: { amount: 29900, durationDays: 30 },
  QUARTERLY: { amount: 79900, durationDays: 90 },
  YEARLY: { amount: 249900, durationDays: 365 },
  LIFETIME: { amount: 499900, durationDays: 36500 },
};

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async getPlans() {
    return Object.entries(PLAN_PRICES).map(([plan, details]) => ({
      plan,
      amount: details.amount,
      currency: 'UZS',
      durationDays: details.durationDays,
    }));
  }

  async createSubscription(userId: number, plan: SubscriptionPlan, provider: PaymentProvider) {
    const planDetails = PLAN_PRICES[plan];
    if (!planDetails) {
      throw new BadRequestException('Invalid subscription plan');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + planDetails.durationDays * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        startsAt: now,
        expiresAt,
        paymentProvider: provider,
        amount: planDetails.amount,
        currency: 'UZS',
      },
    });

    // Update user premium status
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
        role: 'PREMIUM',
      },
    });

    // Cache status in Redis
    await this.redis.set(
      `subscription:${userId}`,
      JSON.stringify({ plan, expiresAt: expiresAt.toISOString() }),
      'EX',
      planDetails.durationDays * 86400,
    );

    return subscription;
  }

  async handleClickCallback(data: {
    click_trans_id: number;
    merchant_trans_id: string;
    amount: number;
    sign_string: string;
    error: number;
  }) {
    if (data.error !== 0) {
      return { error: data.error, error_note: 'Payment failed' };
    }

    const subscriptionId = Number(data.merchant_trans_id);
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return { error: -5, error_note: 'Subscription not found' };
    }

    if (subscription.amount !== data.amount) {
      return { error: -2, error_note: 'Incorrect amount' };
    }

    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        paymentId: String(data.click_trans_id),
        status: 'ACTIVE',
      },
    });

    // Activate premium
    await this.prisma.user.update({
      where: { id: subscription.userId },
      data: {
        isPremium: true,
        premiumExpiresAt: subscription.expiresAt,
        role: 'PREMIUM',
      },
    });

    return { error: 0, error_note: 'Success' };
  }

  async handlePaymeCallback(data: {
    method: string;
    params: {
      id?: string;
      amount?: number;
      account?: { subscription_id?: string };
      reason?: number;
    };
  }) {
    const { method, params } = data;

    switch (method) {
      case 'CheckPerformTransaction': {
        const subscriptionId = Number(params.account?.subscription_id);
        const subscription = await this.prisma.subscription.findUnique({
          where: { id: subscriptionId },
        });

        if (!subscription) {
          return { error: { code: -31050, message: 'Subscription not found' } };
        }

        if (subscription.amount * 100 !== params.amount) {
          return { error: { code: -31001, message: 'Incorrect amount' } };
        }

        return { result: { allow: true } };
      }

      case 'CreateTransaction': {
        const subscriptionId = Number(params.account?.subscription_id);
        await this.prisma.subscription.update({
          where: { id: subscriptionId },
          data: { paymentId: params.id },
        });

        const subscription = await this.prisma.subscription.findUnique({
          where: { id: subscriptionId },
        });

        return {
          result: {
            create_time: Date.now(),
            transaction: String(subscriptionId),
            state: 1,
          },
        };
      }

      case 'PerformTransaction': {
        const subscription = await this.prisma.subscription.findFirst({
          where: { paymentId: params.id },
        });

        if (!subscription) {
          return { error: { code: -31050, message: 'Transaction not found' } };
        }

        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'ACTIVE' },
        });

        await this.prisma.user.update({
          where: { id: subscription.userId },
          data: {
            isPremium: true,
            premiumExpiresAt: subscription.expiresAt,
            role: 'PREMIUM',
          },
        });

        return {
          result: {
            transaction: String(subscription.id),
            perform_time: Date.now(),
            state: 2,
          },
        };
      }

      case 'CancelTransaction': {
        const subscription = await this.prisma.subscription.findFirst({
          where: { paymentId: params.id },
        });

        if (!subscription) {
          return { error: { code: -31050, message: 'Transaction not found' } };
        }

        await this.prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'CANCELLED' },
        });

        await this.prisma.user.update({
          where: { id: subscription.userId },
          data: { isPremium: false, premiumExpiresAt: null, role: 'USER' },
        });

        return {
          result: {
            transaction: String(subscription.id),
            cancel_time: Date.now(),
            state: -1,
          },
        };
      }

      default:
        return { error: { code: -32601, message: 'Method not found' } };
    }
  }

  async handleTelegramStars(
    userId: number,
    data: { telegramPaymentId: string; totalAmount: number; plan: SubscriptionPlan },
  ) {
    const planDetails = PLAN_PRICES[data.plan];
    if (!planDetails) {
      throw new BadRequestException('Invalid plan');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + planDetails.durationDays * 24 * 60 * 60 * 1000);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        plan: data.plan,
        status: 'ACTIVE',
        startsAt: now,
        expiresAt,
        paymentProvider: 'TELEGRAM_STARS',
        paymentId: data.telegramPaymentId,
        amount: data.totalAmount,
        currency: 'XTR',
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpiresAt: expiresAt,
        role: 'PREMIUM',
      },
    });

    await this.redis.set(
      `subscription:${userId}`,
      JSON.stringify({ plan: data.plan, expiresAt: expiresAt.toISOString() }),
      'EX',
      planDetails.durationDays * 86400,
    );

    return subscription;
  }

  async getStatus(userId: number) {
    // Check Redis cache first
    const cached = await this.redis.get(`subscription:${userId}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      const expiresAt = new Date(parsed.expiresAt);
      if (expiresAt > new Date()) {
        return {
          isActive: true,
          plan: parsed.plan,
          expiresAt,
        };
      }
    }

    // Fallback to DB
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'desc' },
    });

    if (!subscription) {
      return { isActive: false, plan: null, expiresAt: null };
    }

    // Cache it
    await this.redis.set(
      `subscription:${userId}`,
      JSON.stringify({ plan: subscription.plan, expiresAt: subscription.expiresAt.toISOString() }),
      'EX',
      Math.floor((subscription.expiresAt.getTime() - Date.now()) / 1000),
    );

    return {
      isActive: true,
      plan: subscription.plan,
      expiresAt: subscription.expiresAt,
    };
  }
}
