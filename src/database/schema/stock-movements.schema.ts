import {
  integer, pgEnum, pgTable,
  serial, text, timestamp, varchar,
} from "drizzle-orm/pg-core";

import { products } from "./products.schema.js";
import { branches } from "./branches.schema.js";

export const sourceType = pgEnum("stock_movement_type", ["stock_in", "stock_out"]);

export const stockMovementType = pgEnum("stock_movement_type", [
  "new_stock", "purchase","sale",
  "whole_sale_purchase",
  "purchase_return","return",
  "adjustment", "damage", "transfer"
]);

export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),

  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),

  branchId: integer("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),

  source: stockMovementType("source").default("new_stock"),

  quantity: integer("quantity").default(0),

  referenceId: integer("reference_id"),

  reason: text("reason"),
  note: text("note"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by", { length: 100 }),
});