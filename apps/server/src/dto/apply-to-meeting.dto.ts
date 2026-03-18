import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class ApplyToMeetingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  applicantId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  applicantName: string;
}
