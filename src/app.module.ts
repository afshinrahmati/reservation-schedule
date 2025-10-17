import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from "./config/app.config";
import redisConfig from "./config/redis.config";
import dbConfig from "./config/database.config";
import rabbitConfig from "./config/rabbit.config";
import {TypeOrmModule} from "@nestjs/typeorm";
import { SwaggerModule } from '@nestjs/swagger';
import {ApiModule} from "./userInterfaces/rest/modules/api/api.module";
import {NotificationModule} from "@/core/notification/notification.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, dbConfig, redisConfig, rabbitConfig],
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: 'mysql',
                host: cfg.get('db.host'),
                port: cfg.get('db.port'),
                username: cfg.get('db.username'),
                password: cfg.get('db.password'),
                database: cfg.get('db.database'),
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        SwaggerModule,
        ApiModule,
        NotificationModule

    ],
})
export class AppModule {}
