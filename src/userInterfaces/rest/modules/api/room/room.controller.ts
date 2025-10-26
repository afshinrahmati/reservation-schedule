import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoomDto } from '@/core/room/application/dto/create-room.dto';
import { UpdateRoomDto } from '@/core/room/application/dto/update-room.dto';
import { ListMyRoomsQuery } from '@/core/room/application/queries/list-my-rooms.query';
import { CreateRoomCommand } from '@/core/room/application/command/create-room.command';
import { UpdateRoomCommand } from '@/core/room/application/command/update-room.command';
import { Roles } from '@/userInterfaces/rest/components/decorators/roles.decorator';
import { AuthApiGuard } from '@/userInterfaces/rest/components/guards/auth-api.guard';
import { GetRoomDailyScheduleQuery } from '@/core/room/application/queries/get-room-schedule.query';
import { GetScheduleDto } from '@/core/room/application/dto/get-schedule.dto';
import { RolesGuard } from '@/userInterfaces/rest/components/guards/roles.guard';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(AuthApiGuard, RolesGuard)
@Roles('HOST', 'ADMIN')
@Controller('rooms')
export class RoomController {
  constructor(
    private cmd: CommandBus,
    private qry: QueryBus,
  ) {}
  @Post('create')
  create(@Body() dto: CreateRoomDto, @Req() req) {
    console.log(dto);
    return this.cmd.execute(new CreateRoomCommand(req.user.id, dto));
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto, @Req() req) {
    return this.cmd.execute(new UpdateRoomCommand(req.user.id, id, dto));
  }
  @Get('my')
  @Roles('HOST', 'ADMIN')
  listMine(@Req() req) {
    return this.qry.execute(new ListMyRoomsQuery(req.user.id));
  }

  @Post(':id/schedule')
  async getSchedule(@Param('id') roomId: string, @Body() q: GetScheduleDto) {
    const fromUtc = q.from ? new Date(q.from) : new Date();
    return this.qry.execute(
      new GetRoomDailyScheduleQuery(roomId, fromUtc, q.days ?? 15),
    );
  }
}
