import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class RequestOtpDto {
  @ApiProperty({ example: "9999999999" })
  @IsString()
  @Length(10, 10)
  phone: string;
}
