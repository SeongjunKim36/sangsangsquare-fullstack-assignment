import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  userId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}
