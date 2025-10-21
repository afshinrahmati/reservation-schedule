import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuxOutboxNotifications1710000001000 implements MigrationInterface {
  name = 'AuxOutboxNotifications1710000001000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`
      CREATE TABLE IF NOT EXISTS booking_events (
        id bigserial PRIMARY KEY,
        booking_id uuid,
        type text NOT NULL,
        payload jsonb NOT NULL,
        occurred_at timestamptz NOT NULL DEFAULT now(),
        sent_at timestamptz
      );
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_booking_events_unsent ON booking_events(sent_at);`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS notification_logs (
        id bigserial PRIMARY KEY,
        user_id uuid,
        channel text NOT NULL,  -- email | push
        template text NOT NULL, -- payment_expired | booking_created | ...
        payload jsonb,
        sent_at timestamptz NOT NULL DEFAULT now(),
        success boolean NOT NULL DEFAULT true,
        error text
      );
    `);
    await q.query(`CREATE INDEX IF NOT EXISTS idx_notification_user ON notification_logs(user_id, sent_at DESC);`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS notification_logs;`);
    await q.query(`DROP TABLE IF EXISTS booking_events;`);
  }
}