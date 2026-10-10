import {
  boolean, integer, numeric, pgEnum,
  pgTable, serial, varchar, timestamp,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { categories } from "./categories.schema.js";
import { branches } from "./branches.schema.js";

export const stockStatusEnum = pgEnum("stock_status", [
  "in_stock", "few_only_available",
  "out_of_stock", "blocked",
]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  branchId: integer("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),

  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),

  name: varchar("name", { length: 150 }).notNull(),

  note: varchar("name", { length: 150 }).notNull(),

  productCode: varchar("product_code", { length: 50 }),

  hsnCode: varchar("hsn_code", { length: 20 }),

  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default("0"),

  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }),

  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull(),

  isActive: boolean("is_active").notNull().default(true),

  stockStatus: stockStatusEnum("stock_status").default("in_stock"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});