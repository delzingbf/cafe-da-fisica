import type {
    SettingsResponse,
    UpdateOrderNotificationEmailResponse,
} from '@cafe-da-fisica/shared';
import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import type { Admin } from '../admins/admin.entity.js';
import { AdminGuard, CurrentAdmin } from '../auth/admin.guard.js';
import { UpdateOrderNotificationEmailDto } from './settings.dto.js';
import { SettingsService } from './settings.service.js';

@Controller('settings')
@UseGuards(AdminGuard)
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @Get()
    getSettings(): Promise<SettingsResponse> {
        return this.settingsService.getSettings();
    }

    @Put('order-notification-email')
    updateOrderNotificationEmail(
        @Body() dto: UpdateOrderNotificationEmailDto,
        @CurrentAdmin() admin: Admin,
    ): Promise<UpdateOrderNotificationEmailResponse> {
        return this.settingsService.updateOrderNotificationEmail(dto.email, admin);
    }
}
