import { registerAs } from '@nestjs/config';

export default registerAs('rabbit', () => ({
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
  user: process.env.RABBITMQ_USER || 'Admin',
  password: process.env.RABBITMQ_PASSWORD || 'Guest!@3',
}));
