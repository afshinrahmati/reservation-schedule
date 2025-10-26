import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(to: string, message: string) {
    try {
      this.logger.log(`📱 SMS → ${to}: ${message}`);
      return true;
    } catch (err) {
      this.logger.error(`❌ SMS failed: ${err.message}`);
      throw err;
    }
  }
}
