import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import {JwtAuthGuard} from "@/userInterfaces/rest/components/guards/jwt-auth.guard";

@Module({
    imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
    providers: [JwtAuthGuard],
    exports: [JwtAuthGuard],
})
export class UiGuardsModule {}