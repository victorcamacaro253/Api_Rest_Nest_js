import { IsNumber, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStockDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  product: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  supplier: number;

  @ApiProperty({ example: 'active' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
