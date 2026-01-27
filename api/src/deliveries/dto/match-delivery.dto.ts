import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class MatchDeliveryDto {
  @ApiProperty({ example: "trip-uuid" })
  @IsString()
  tripId: string;
}
