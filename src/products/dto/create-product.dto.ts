import { IsString, IsNumber, IsNotEmpty, Min,IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  category_id: number;

   @IsOptional() // Make imagePath optional
    @IsString() // Ensure it's a string if provided
    imagePath?: string; // Use optional chaining

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  supplier: number;
}
