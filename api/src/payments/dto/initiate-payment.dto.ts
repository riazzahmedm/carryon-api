import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class InitiatePaymentDto {
  @ApiProperty({ example: "delivery-uuid" })
  @IsString()
  deliveryId: string;

  @ApiProperty({ example: "trip-uuid" })
  @IsString()
  tripId: string;
}
