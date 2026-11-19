
import {
  IsBoolean,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export class CreateProductDto {
  @IsOptional()
  @IsUUID()
  branchId?: string | null;

  // @IsOptional()
  @IsUUID()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  productCode?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  hsnCode?: string;

  @IsOptional()
  @IsString()
  productType: string;

  @IsOptional()
  @IsNumberString()
  gstRate?: string;

  @IsOptional()
  @IsNumberString()
  purchasePrice?: string;
  
  @IsOptional()
  @IsNumberString()
  sellingPrice?: string;
  
  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsNumberString()
  quantity?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsString()
  stockStatus?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
