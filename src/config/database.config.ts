import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.PSQL_HOST ?? 'localhost',
  port: process.env.PSQL_PORT ? Number(process.env.PSQL_PORT) : 5432,
  username: process.env.PSQL_USERNAME ?? 'app',
  password: process.env.PSQL_PASS ?? 'app',
  db: process.env.PSQL_DB ?? 'hotel',
  logging: true,
}));
