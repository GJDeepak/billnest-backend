import {
  Injectable, Inject,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import {
  and,
  eq,
  gte,
  isNull,
  sql,
} from "drizzle-orm";

import { DATABASE } from "../../database/database.module.js";
import { shops } from "../../database/schema/shops.schema.js";
import { branches } from "../../database/schema/branches.schema.js";
import { products } from "../../database/schema/products.schema.js";
import { inventory } from "../../database/schema/inventory.schema.js";

import {
  sales,
  saleItems,
  salePayments,
} from "../../database/schema/sales.schema.js";

import { CreateSaleDto } from "./dto/sales.dto.js";
import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";

@Injectable()
export class SalesService {
  constructor(
    @Inject(DATABASE) private readonly db: any,
  ) {}

  // Convert a number to a database numeric string.
  private money(value: number): string {
    return value.toFixed(2);
  }

  async createSale(userId: string, shopId: string, dto: CreateSaleDto) {
    try {
      return await this.db.transaction(async (tx: any) => {
        // 1. Validate shop ownership
        const [shop] = await tx
          .select({ id: shops.id })
          .from(shops)
          .where(and(eq(shops.id, shopId), eq(shops.userId, userId)))
          .limit(1);

        if (!shop) {
          throw new NotFoundException("Shop not found!");
        }

        // 2. Validate branch ownership
        if (dto.branchId) {
          const [branch] = await tx
            .select({ id: branches.id })
            .from(branches)
            .where(and(eq(branches.id, dto.branchId), eq(branches.shopId, shopId)))
            .limit(1);

          if (!branch) {
            throw new NotFoundException("Branch not found!");
          }
        }

        // 3. Validate sale items
        if (!dto.items?.length) {
          throw new BadRequestException("At least one sale item is required!");
        }

        // 4. Prepare sale items and calculate totals
        const preparedItems: any[] = [];

        let subtotal = 0;
        let itemDiscountTotal = 0;
        let gstTotal = 0;

        for (const item of dto.items) {
          if (!item.productId) {
            throw new BadRequestException(`Product ID is required for ${item.productName}`);
          }

          const quantity = Number(item.quantity);
          const unitPrice = Number(item.unitPrice);
          const gstRate = Number(item.gstRate);
          const itemDiscount = Number(item.discountAmount ?? "0");

          if (
            !Number.isFinite(quantity) ||
            quantity <= 0 ||
            !Number.isFinite(unitPrice) ||
            unitPrice < 0 ||
            !Number.isFinite(gstRate) ||
            gstRate < 0 ||
            !Number.isFinite(itemDiscount) ||
            itemDiscount < 0
          ) {
            throw new BadRequestException(`Invalid price, quantity, GST or discount for ${item.productName}`);
          }

          if (itemDiscount > quantity * unitPrice) {
            throw new BadRequestException(`Discount cannot exceed item value for ${item.productName}`);
          }

          const [product] = await tx
            .select()
            .from(products)
            .where(
              and(
                eq(products.id, item.productId),
                eq(products.shopId, shopId),
                eq(products.isDeleted, false),
                eq(products.isActive, true),
              ),
            )
            .limit(1);

          if (!product) {
            throw new NotFoundException(`Product not found: ${item.productName}`);
          }

          const lineSubtotal = quantity * unitPrice;

          subtotal += lineSubtotal;
          itemDiscountTotal += itemDiscount;

          preparedItems.push({ product, quantity, unitPrice, gstRate, itemDiscount, lineSubtotal });
        }

        // 5. Calculate invoice-level discount
        const invoiceDiscount = Number(dto.discountAmount);

        if (!Number.isFinite(invoiceDiscount) || invoiceDiscount < 0) {
          throw new BadRequestException("Invalid discount amount!");
        }

        const totalBeforeDiscount = subtotal;

        if (invoiceDiscount + itemDiscountTotal > totalBeforeDiscount) {
          throw new BadRequestException("Total discount cannot exceed subtotal!");
        }

        const totalDiscount = invoiceDiscount + itemDiscountTotal;

        // Allocate invoice discount proportionally to items.
        let allocatedInvoiceDiscount = 0;

        const finalItems = preparedItems.map((item, index) => {
          let invoiceDiscountShare = 0;

          if (totalBeforeDiscount > 0) {
            if (index === preparedItems.length - 1) {
              invoiceDiscountShare = invoiceDiscount - allocatedInvoiceDiscount;
            } else {
              invoiceDiscountShare = Number((invoiceDiscount * (item.lineSubtotal / totalBeforeDiscount)).toFixed(2));

              allocatedInvoiceDiscount += invoiceDiscountShare;
            }
          }

          const finalDiscount = item.itemDiscount + invoiceDiscountShare;

          const taxableAmount = item.lineSubtotal - finalDiscount;

          const gstAmount = Number(((taxableAmount * item.gstRate) / 100).toFixed(2));

          const totalAmount = Number((taxableAmount + gstAmount).toFixed(2));

          gstTotal += gstAmount;

          return {
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            gstRate: item.gstRate,
            discountAmount: finalDiscount,
            taxableAmount,
            gstAmount,
            totalAmount,
          };
        });

        subtotal = Number(subtotal.toFixed(2));
        gstTotal = Number(gstTotal.toFixed(2));

        const grandTotal = Number((subtotal - totalDiscount + gstTotal).toFixed(2));

        // 6. Validate payment
        const paymentAmount = Number(dto.amount);

        if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
          throw new BadRequestException("Invalid payment amount!");
        }

        if (paymentAmount > grandTotal) {
          throw new BadRequestException("Payment amount cannot exceed invoice total!");
        }

        const balanceDue = Number((grandTotal - paymentAmount).toFixed(2));

        const paymentStatus = (balanceDue === 0)? "paid": (paymentAmount > 0)? "partial": "unpaid";

        // 7. Create sale
        const [sale] = await tx
          .insert(sales)
          .values({
            shopId,
            branchId: dto.branchId ?? null,
            customerId: dto.customerId ?? null,
            saleType: dto.saleType,
            invoiceNumber: dto.invoiceNumber,
            invoiceDate: (dto.invoiceDate) ?? new Date().toISOString().slice(0, 10),
            subtotal: this.money(subtotal),
            discountAmount: this.money(totalDiscount),
            gstAmount: this.money(gstTotal),
            grandTotal: this.money(grandTotal),
            amountReceived: this.money(paymentAmount),
            balanceDue: this.money(balanceDue),
            paymentStatus,
            saleStatus: "completed",
            note: dto.note ?? null,
          })
          .returning();

        // 8. Insert sale items and deduct inventory
        const insertedItems: any[] = [];

        for (const item of finalItems) {
          const inventoryBranchCondition = (dto.branchId)? eq(inventory.branchId, dto.branchId): isNull(inventory.branchId);

          const [stock] = await tx
            .select()
            .from(inventory)
            .where(
              and(
                eq(inventory.shopId, shopId),
                eq(inventory.productId, item.product.id),
                eq(inventory.isDeleted, false),
                inventoryBranchCondition,
              ),
            )
            .limit(1);

          if (!stock) {
            throw new NotFoundException(`Inventory not found for ${item.product.name}`);
          }

          const [updatedStock] = await tx
            .update(inventory)
            .set({
              quantity: sql`${inventory.quantity} - ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(and(eq(inventory.id, stock.id), gte(inventory.quantity, String(item.quantity))))
            .returning();

          if (!updatedStock) {
            throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
          }

          const [saleItem] = await tx
            .insert(saleItems)
            .values({
              saleId: sale.id,
              productId: item.product.id,
              productName: item.product.name,
              productCode: item.product.productCode,
              hsnCode: item.product.hsnCode,
              quantity: String(item.quantity),
              unit: stock.unit,
              unitPrice: this.money(item.unitPrice),
              discountAmount: this.money(item.discountAmount),
              taxableAmount: this.money(item.taxableAmount),
              gstRate: this.money(item.gstRate),
              gstAmount: this.money(item.gstAmount),
              totalAmount: this.money(item.totalAmount),
            })
            .returning();

          insertedItems.push(saleItem);
        }

        // 9. Record payment only when amount is greater than zero
        let payment: any = null;

        if (paymentAmount > 0) {
          [payment] = await tx
            .insert(salePayments)
            .values({
              saleId: sale.id,
              paymentMethod: dto.paymentMethod,
              amount: this.money(paymentAmount),
              referenceNumber: dto.referenceNumber ?? null,
            })
            .returning();
        }

        // 10. Return response
        return {
          success: true,
          message: "Sale created successfully",
          data: {
            sale,
            items: insertedItems,
            payment,
          },
        };
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
