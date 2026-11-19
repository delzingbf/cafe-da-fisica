import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../../infrastructure/mail/mail.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { Settings } from './settings.entity.js';
import { SettingsController } from './settings.controller.js';
import { SettingsService } from './settings.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Settings]), AuthModule, MailModule],
    controllers: [SettingsController],
    providers: [SettingsService],
})
export class SettingsModule {}
