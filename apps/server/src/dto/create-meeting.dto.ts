import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { MeetingType } from "../entity/meeting.entity";

export class CreateMeetingDto {
  @IsEnum(MeetingType)
  type: MeetingType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsDateString()
  announcementAt: string;
}
