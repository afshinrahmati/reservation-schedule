import { Module } from '@nestjs/common';
import {HealthModule} from "./health/health.module";
import {AuthModule} from "@/userInterfaces/rest/modules/api/auth/auth.module";
import {BookingModule} from "@/userInterfaces/rest/modules/api/booking/booking.module";

@Module({
    imports: [AuthModule,BookingModule],
})
export class ApiModule {}
