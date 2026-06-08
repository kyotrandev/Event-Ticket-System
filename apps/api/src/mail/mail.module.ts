import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailerModule } from '../mailer/mailer.module';
import { BullModule } from '@nestjs/bullmq';
import { EmailProcessor } from './processors/email.processor';

@Module({
  imports: [
    ConfigModule,
    MailerModule,
    BullModule.registerQueue({ name: 'email' }),
  ],
  providers: [MailService, EmailProcessor],
  exports: [MailService, BullModule],
})
export class MailModule {}
