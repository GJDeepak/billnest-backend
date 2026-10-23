import { IsNotEmpty, IsOptional, IsString, IsBoolean, MaxLength } from "class-validator";

export class createCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    description: string
}

export class UpdateCategoryByIdDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}