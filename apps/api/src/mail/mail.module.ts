import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';

// Import in any feature module that sends email (e.g. OrdersModule) and inject MailService.
@Module({
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
