import { Controller, Get, Post, Body } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { SubscriptionPlan, PaymentProvider } from '@prisma/client';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Post('create')
  async createSubscription(
    @CurrentUser('sub') userId: number,
    @Body() dto: { plan: SubscriptionPlan; provider: PaymentProvider },
  ) {
    return this.subscriptionService.createSubscription(userId, dto.plan, dto.provider);
  }

  @Public()
  @Post('click/callback')
  async handleClickCallback(@Body() data: any) {
    return this.subscriptionService.handleClickCallback(data);
  }

  @Public()
  @Post('payme/callback')
  async handlePaymeCallback(@Body() data: any) {
    return this.subscriptionService.handlePaymeCallback(data);
  }

  @Post('telegram-stars')
  async handleTelegramStars(
    @CurrentUser('sub') userId: number,
    @Body() data: { telegramPaymentId: string; totalAmount: number; plan: SubscriptionPlan },
  ) {
    return this.subscriptionService.handleTelegramStars(userId, data);
  }

  @Get('status')
  async getStatus(@CurrentUser('sub') userId: number) {
    return this.subscriptionService.getStatus(userId);
  }
}
