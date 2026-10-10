
import {
  check, integer, numeric,
  pgEnum, pgTable, serial,
  text, timestamp, unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { shops } from "./shops.schema.js";
import { branches } from "./branches.schema.js";
import { products } from "./products.schema.js";

export const stockStatusEnum = pgEnum("stock_status", ["in_stock", "low_stock", "out_of_stock"]);

export const adjustmentReasonEnum = pgEnum("adjustment_reason", [
  "new_stock", "physical_count_correction",
  "return", "expired", "damage", "wastage" 
]);

export const adjustmentTypeEnum = pgEnum("adjustment_type", ["added", "removed", "updated"]);

export const stocks = pgTable("stocks", {
    id: serial("id").primaryKey(),

    shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

    branchId: integer("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),

    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),

    quantity: numeric("quantity", { precision: 14, scale: 3 }).notNull().default("0"),
    
    reason: text("reason"),
    note: text("note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
    unique("stocks_branch_product_unique").on(
        table.branchId,
        table.productId,
    ),
    // check(
    //   "stocks_quantity_non_negative",
    //   sql`${table.quantity} >= 0`,
    // ),
]);

export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;