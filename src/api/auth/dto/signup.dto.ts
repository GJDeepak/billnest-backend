import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
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

  @IsNumber()
  // @MinLength(7)
  mobile: number;

  @IsString()
  @IsOptional()
  countryCode: string;

  @IsString()
  @IsOptional()
  userRole: string;
  
  @IsString()
  @IsOptional()
  businessType: string;

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

  @IsBoolean()
  @IsOptional()
  termsAccepted: boolean;
}