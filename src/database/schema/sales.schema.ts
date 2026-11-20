
import {
  pgTable, pgEnum, uuid, varchar, text,
  numeric, timestamp, date, index, uniqueIndex,
} from "drizzle-orm/pg-core";

import { shops, paymentMethodEnum } from "./shops.schema.js";
import { branches } from "./branches.schema.js";
import { products } from "./products.schema.js";

// Enums
export const saleTypeEnum = pgEnum("sale_type", ["retail", "wholesale"]);

export const saleStatusEnum = pgEnum("sale_status", ["completed","cancelled"]);

export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "partial", "paid"]);

// export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "online", "upi"]);

// 1. Sales table
export const sales = pgTable("sales", {
    id: uuid("id").defaultRandom().primaryKey(),

    shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

    branchId: uuid("branch_id").references(() => branches.id, { onDelete: "set null" }),

    // Connect this to your customers table when available.
    // Nullable for retail walk-in customers.
    customerId: uuid("customer_id"),

    saleType: saleTypeEnum("sale_type").notNull(),

    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),

    invoiceDate: date("invoice_date").notNull(),

    saleStatus: saleStatusEnum("sale_status").notNull().default("completed"),

    paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),

    subtotal: numeric("subtotal", { precision: 14, scale: 2 }).notNull().default("0"),

    discountAmount: numeric("discount_amount", { precision: 14, scale: 2 }).notNull().default("0"),

    gstAmount: numeric("gst_amount", { precision: 14, scale: 2 }).notNull().default("0"),

    grandTotal: numeric("grand_total", { precision: 14, scale: 2 }).notNull().default("0"),

    amountReceived: numeric("amount_received", { precision: 14, scale: 2 }).notNull().default("0"),

    balanceDue: numeric("balance_due", { precision: 14, scale: 2 }).notNull().default("0"),

    note: text("note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sales_shop_invoice_unique").on(table.shopId, table.invoiceNumber),

    index("sales_shop_id_idx").on(table.shopId),
    index("sales_branch_id_idx").on(table.branchId),
    index("sales_customer_id_idx").on(table.customerId),
    index("sales_invoice_date_idx").on(table.invoiceDate),
    index("sales_sale_type_idx").on(table.saleType),
    index("sales_payment_status_idx").on(table.paymentStatus),
  ],
);

// 2. Sale items table
export const saleItems = pgTable("sale_items", {
  id: uuid("id").defaultRandom().primaryKey(),

  saleId: uuid("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),

  // Preserve invoice history even if the product is deleted.
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),

  // Product details are stored as snapshots.
  productName: varchar("product_name", { length: 150 }).notNull(),

  productCode: varchar("product_code", { length: 50 }),

  hsnCode: varchar("hsn_code", { length: 20 }),

  quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull(),

  unit: varchar("unit", { length: 30 }).notNull(),

  unitPrice: numeric("unit_price", { precision: 14, scale: 2 }).notNull(),

  discountAmount: numeric("discount_amount", { precision: 14, scale: 2 }).notNull().default("0"),

  taxableAmount: numeric("taxable_amount", { precision: 14, scale: 2 }).notNull().default("0"),

  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).notNull().default("0"),

  gstAmount: numeric("gst_amount", { precision: 14, scale: 2 }).notNull().default("0"),

  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => [
  index("sale_items_sale_id_idx").on(table.saleId),
  index("sale_items_product_id_idx").on(table.productId),
],);

// 3. Sale payments table
export const salePayments = pgTable("sale_payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  saleId: uuid("sale_id").notNull().references(() => sales.id, { onDelete: "cascade" }),

  paymentMethod: paymentMethodEnum("payment_method").notNull(),

  amount: numeric("amount", { precision: 14, scale: 2, }).notNull(),

  referenceNumber: varchar("reference_number", { length: 100 }),

  note: text("note"),

  paidAt: timestamp("paid_at").defaultNow().notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
},
(table) => [
  index("sale_payments_sale_id_idx").on(table.saleId),
  index("sale_payments_paid_at_idx").on(table.paidAt),
]);
