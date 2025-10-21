import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from "./config/app.config";
import redisConfig from "./config/redis.config";
import dbConfig from "./config/database.config";
import rabbitConfig from "./config/rabbit.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SwaggerModule } from '@nestjs/swagger';
import { NotificationModule } from "@/core/notification/notification.module";
import { IdentityModule } from './core/identity/identity.module';
import { EventBusPort } from './core/_shared/application/ports/event-bus.port';
import { RabbitMQEventBusAdapter } from './infrastructure/eventbus/rabbitmq-event-bus.adapter';
import {BookingModule} from "@/core/booking/booking.module";
import {RoomModule} from "@/core/room/room.module";
import {SecurityModule} from "@/core/_shared/security/security.module";
import {UiGuardsModule} from "@/userInterfaces/rest/components/guards/ui-guards.module";
import {AuthApiModule} from "@/userInterfaces/rest/components/guards/auth-api.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, dbConfig, redisConfig, rabbitConfig],
        }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (cfg: ConfigService) => ({
                type: 'postgres',
                host: cfg.get<string>('database.host'),
                port: cfg.get<number>('database.port'),
                username: cfg.get<string>('database.username'),
                password: cfg.get<string>('database.password'),
                database: cfg.get<string>('database.db'),
                autoLoadEntities: true,
                synchronize: false,
                logging: true,
                entities: [__dirname + '/**/*.entity.{ts,js}'],
                migrations: [__dirname + '/migrations/*.{ts,js}'],
                
            })
        }),
        AuthApiModule,
        SwaggerModule,
        IdentityModule,
        NotificationModule,
        RoomModule,
        BookingModule,
    ],
    providers: [
        { provide: EventBusPort, useClass: RabbitMQEventBusAdapter },
    ],
})
export class AppModule { }
