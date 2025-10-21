import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoomDto } from '@/core/room/application/dto/create-room.dto';
import { UpdateRoomDto } from '@/core/room/application/dto/update-room.dto';
import { ListMyRoomsQuery } from '@/core/room/application/queries/list-my-rooms.query';
import {CreateRoomCommand} from "@/core/room/application/command/create-room.command";
import {UpdateRoomCommand} from "@/core/room/application/command/update-room.command";
import {Roles} from "@/userInterfaces/rest/components/decorators/roles.decorator";
import {RolesGuard} from "@/userInterfaces/rest/components/guards/roles.guard";
import {JwtAuthGuard} from "@/userInterfaces/rest/components/guards/jwt-auth.guard";
import {AuthApiGuard} from "@/userInterfaces/rest/components/guards/auth-api.guard";


@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthApiGuard)
@Roles('HOST','ADMIN')
@Controller('rooms')
export class RoomController {
    constructor(private cmd: CommandBus, private qry: QueryBus) {}
    @Post()
    create(@Body() dto: CreateRoomDto, @Req() req) {
        console.log(dto)
        return this.cmd.execute(new CreateRoomCommand(req.user.id, dto));
    }
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateRoomDto, @Req() req) {
        return this.cmd.execute(new UpdateRoomCommand(req.user.id, id, dto));
    }
    @Get('my')
    @Roles('HOST','ADMIN')
    listMine(@Req() req) { return this.qry.execute(new ListMyRoomsQuery(req.user.id)); }
}