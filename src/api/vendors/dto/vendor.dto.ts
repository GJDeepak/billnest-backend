import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  mobile: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(25)
  gstNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  // @IsNumberString()
  creditLimit?: string | number;

  @IsOptional()
  // @IsNumberString()
  openingBalance?: string | number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;
}

export class UpdateVendorDto extends PartialType(CreateVendorDto) {}