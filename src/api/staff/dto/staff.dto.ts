
import { PartialType } from "@nestjs/mapped-types";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

// import { staffRoleEnum } from "../../../database/schema/staff.schema.js";

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  mobile: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsOptional()
  @IsEnum(["manager", "sales_staff", "cashier", "accountant", "stock_manager", "other"])
  role?: string;

  @IsDateString()
  joiningDate: string;

  @IsNumberString()
  monthlySalary: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  dutyStatus?: string;

  @IsOptional()
  @IsString()
  address?: string;
}

export class UpdateStaffDto extends PartialType(CreateStaffDto) {}