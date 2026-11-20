
import {
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";

import { Type } from "class-transformer";

// Sale item DTO
export class CreateSaleItemDto {
  @IsOptional()
  @IsUUID()
  productId?: string | null;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  productName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  productCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  hsnCode?: string;

  @IsNumberString()
  quantity: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsNumberString()
  unitPrice: string;

  @IsOptional()
  @IsNumberString()
  discountAmount?: string;

  @IsOptional()
  @IsNumberString()
  taxableAmount?: string;

  @IsNumberString()
  gstRate: string;

  @IsNumberString()
  gstAmount: string;

  @IsNumberString()
  totalAmount: string;
}

// Create sale DTO
export class CreateSaleDto {
  @IsIn(["retail", "wholesale"])
  saleType: "retail" | "wholesale";

  @IsOptional()
  @IsUUID()
  customerId?: string | null;

  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsUUID()
  shopId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  invoiceNumber: string;

  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  @IsNumberString()
  subtotal: string;

  @IsNumberString()
  discountAmount: string;

  @IsNumberString()
  gstAmount: string;

  @IsNumberString()
  grandTotal: string;

  @IsNumberString()
  amountReceived: string;

  @IsNumberString()
  balanceDue: string;

  @IsIn(["unpaid", "partial", "paid"])
  paymentStatus: "unpaid" | "partial" | "paid";

  @IsIn(["cash", "card", "online", "upi"])
  paymentMethod: "cash" | "card" | "online" | "upi";

  @IsNumberString()
  amount: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}