import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusEvent } from '@prisma/client';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @IsOptional()
  @IsEnum(StatusEvent)
  status?: StatusEvent;
}