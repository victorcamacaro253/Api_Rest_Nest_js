import { IsString,IsEmail, IsNotEmpty,MinLength, IsNumber,IsOptional } from 'class-validator';
import { Column } from 'typeorm';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(7, { message: 'Password must be at least 7 characters' })
  password: string;

  
  @IsString()
  @IsNotEmpty()
  personal_ID: string;

  @Column()
  role: number; 

  @IsOptional() // Make imagePath optional
  @IsString() // Ensure it's a string if provided
  imagePath?: string; // Use optional chaining

  @IsNotEmpty()
  name: string;

}