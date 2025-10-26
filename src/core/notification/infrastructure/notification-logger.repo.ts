import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationLoggerRepo {
  constructor(private ds: DataSource) {}
  async log(input: {
    userId?: string;
    channel: 'email' | 'sms';
    template: string;
    payload: any;
    success: boolean;
    error?: string;
  }) {
    console.log('LOGGGGG IN DATA BASE');
    // await this.ds.query(
    //   `INSERT INTO notification_logs(user_id, channel, template, payload, success) VALUES ($1,$2,$3,$4,$5)`,
    //   [
    //     input.userId ?? null,
    //     input.channel,
    //     input.template,
    //     JSON.stringify(input.payload),
    //     input.success,
    //   ],
    // );
  }
}
