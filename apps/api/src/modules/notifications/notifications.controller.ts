import { Controller, Get, Patch, Delete, Param, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getNotifications(
    @CurrentUser('sub') userId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.notificationsService.getUserNotifications(userId, pagination.page, pagination.limit);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('sub') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('sub') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  @Delete(':id')
  deleteNotification(
    @CurrentUser('sub') userId: number,
    @Param('id', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationsService.deleteNotification(notificationId, userId);
  }
}
