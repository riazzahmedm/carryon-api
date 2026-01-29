import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsString, Min } from "class-validator";

export class CreateTripDto {
  @ApiProperty({ example: "HYD" })
  @IsString()
  fromCity: string;

  @ApiProperty({ example: "MAA" })
  @IsString()
  toCity: string;

  @ApiProperty({ example: "2026-02-01T10:30:00Z" })
  @IsDateString()
  flightDate: string;

  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(1)
  capacityKg: number;
}
