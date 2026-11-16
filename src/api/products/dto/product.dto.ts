
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
  categoryId?: string | null;

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
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
