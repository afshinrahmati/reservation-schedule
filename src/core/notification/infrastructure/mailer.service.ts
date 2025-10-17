
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);

    async sendMail(to: string, subject: string, message: string) {
        try {
            this.logger.log(`📧 Email → ${to}: ${subject}`);
            // mock
            return true;
        } catch (err) {
            this.logger.error(`❌ Email failed: ${err.message}`);
            throw err;
        }
    }
}