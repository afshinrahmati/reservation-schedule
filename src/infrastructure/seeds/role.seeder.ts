import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RoleSeeder implements OnModuleInit {
    constructor(private ds: DataSource) {}
    async onModuleInit() {
        await this.ds.query(`
      INSERT INTO roles (code, name) VALUES
      ('ADMIN','Administrator'),
      ('HOST','Hotel Owner/Host'),
      ('GUEST','Guest')
      ON CONFLICT (code) DO NOTHING;
    `);
    }
}