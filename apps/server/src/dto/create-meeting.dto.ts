import { Transform } from "class-transformer";
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

const trimString = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateMeetingDto {
  @IsEnum(MeetingType)
  type: MeetingType;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @Transform(trimString)
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
