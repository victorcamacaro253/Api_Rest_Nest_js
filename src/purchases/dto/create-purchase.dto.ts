import { IsNumber, IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PurchasedProductDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @ApiProperty({ example: 'Credit Card' })
  @IsString()
  @IsOptional()
  payment_method?: string;

  @ApiProperty({ example: 'PROMO123' })
  @IsString()
  @IsOptional()
  promo_code?: string;

  @ApiProperty({ type: [PurchasedProductDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchasedProductDto)
  products: PurchasedProductDto[];
}
