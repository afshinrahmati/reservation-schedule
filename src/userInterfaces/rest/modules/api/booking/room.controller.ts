import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {JwtAuthGuard} from "@/userInterfaces/rest/components/guards/jwt-auth.guard";
import {RolesGuard} from "@/userInterfaces/rest/components/guards/roles.guard";
import {Roles} from "@/userInterfaces/rest/components/decorators/roles.decorator";
import {CreateRoomHandler} from "@/core/booking/application/create-room.handler";
import {CreateRoomDto} from "@/userInterfaces/rest/modules/api/booking/booking.dto";
import {CreateRoomCommand} from "@/core/booking/application/create-room.command";

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOST', 'ADMIN')
@Controller('rooms')
export class RoomController {
    constructor(private readonly createRoom: CreateRoomHandler) {}

    @Post()
    create(@Body() dto: CreateRoomDto, @Req() req: any) {
        const ownerId = req.user?.id;
        return this.createRoom.execute(new CreateRoomCommand(ownerId, dto.name, dto.slotDurationMinutes));
    }
}