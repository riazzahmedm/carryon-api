import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString, Min } from "class-validator";

export class CreateDeliveryDto {
  @ApiProperty({ example: "Documents" })
  @IsString()
  itemName: string;

  @ApiProperty({ example: "DOCUMENTS" })
  @IsString()
  itemCategory: string;

  @ApiProperty({ example: 1.5 })
  @IsNumber()
  @Min(0.1)
  weightKg: number;

  @ApiProperty({ example: 3000 })
  @IsInt()
  @Min(1)
  declaredValue: number;
}
