import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class BusinessSetupDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  shopName: string;

  @IsString()
  gstNumber: string;

  @IsString()
  billPrefix: string;
  
  @IsNumber()
  billStartNumber: number;

  @IsString()
  @IsOptional()
  businessType: string;

  @IsString()
  @IsOptional()
  invoiceType: string;

  @IsString()
  @IsOptional()
  paymentMethod: string;

  @IsString()
  @IsOptional()
  billSize: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  adress: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address: string;

  @IsNumber()
//   @MinLength(6, { message: "Pincode must be at least 6 characters" })
//   @MaxLength(6, { message: "Pincode must not exceed 6 characters" })
//   @Matches(/^\d{6}$/)
  pincode: number;
}
