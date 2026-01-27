import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class SignupUserDto {
  @ApiProperty({ example: "Riaz Ahmed" })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: "riaz@example.com" })
  @IsEmail()
  email: string;
}
