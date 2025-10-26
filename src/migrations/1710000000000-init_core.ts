import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitCore1710000000000 implements MigrationInterface {
  name = 'InitCore1710000000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    await q.query(`CREATE EXTENSION IF NOT EXISTS btree_gist;`);

    await q.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code text NOT NULL UNIQUE,   -- ADMIN | HOST | GUEST
        name text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await q.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        full_name text,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await q.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      );
    `);

    await q.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
        name text NOT NULL,
        slot_duration_min int NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS idx_rooms_owner ON rooms(owner_id);`,
    );

    await q.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_at timestamptz NOT NULL,
        end_at timestamptz NOT NULL,
        status text NOT NULL,  -- PENDING | CONFIRMED | CANCELLED | EXPIRED
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    await q.query(
      `CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);`,
    );
    await q.query(
      `CREATE INDEX IF NOT EXISTS idx_bookings_room_time ON bookings(room_id, start_at, end_at);`,
    );

    await q.query(`
      ALTER TABLE bookings
      ADD CONSTRAINT no_overlap_per_room
      EXCLUDE USING gist (
        room_id WITH =,
        tstzrange(start_at, end_at, '[)') WITH &&
      );
    `);

    await q.query(`
      INSERT INTO roles (code, name) VALUES
        ('ADMIN','Administrator'),
        ('HOST','Hotel Owner/Host'),
        ('GUEST','Guest')
      ON CONFLICT (code) DO NOTHING;
    `);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE IF EXISTS bookings DROP CONSTRAINT IF EXISTS no_overlap_per_room;`,
    );
    await q.query(`DROP TABLE IF EXISTS bookings;`);
    await q.query(`DROP TABLE IF EXISTS rooms;`);
    await q.query(`DROP TABLE IF EXISTS user_roles;`);
    await q.query(`DROP TABLE IF EXISTS users;`);
    await q.query(`DROP TABLE IF EXISTS roles;`);
  }
}
