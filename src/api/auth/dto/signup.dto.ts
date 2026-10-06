import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  userRole: string;
  
  @IsString()
  @IsOptional()
  city: string;
  
  @IsString()
  @IsOptional()
  state: string;
  
  @IsString()
  @IsOptional()
  country: string;
  
  @IsString()
  @IsOptional()
  location: string;
}