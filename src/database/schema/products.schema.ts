import {
  boolean, integer, numeric, pgEnum,
  pgTable, serial, varchar, timestamp,
  uuid, index, uniqueIndex,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { categories } from "./categories.schema.js";
import { branches } from "./branches.schema.js";
import { sql } from "drizzle-orm";

export const stockStatusEnum = pgEnum("stock_status", [
  "in_stock", "few_only_available",
  "out_of_stock", "blocked",
]);

export const productTypeEnum = pgEnum("product_type", ["retail", "wholesale"])

export const products = pgTable("products", {
  // id: serial("id").primaryKey(),
  // shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),
  // branchId: integer("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),
  // categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),

  id: uuid("id").primaryKey().defaultRandom(),

  shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  branchId: uuid("branch_id").references(() => branches.id, { onDelete: "cascade" }),

  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),

  name: varchar("name", { length: 150 }).notNull(),

  note: varchar("note", { length: 250 }).notNull(),

  productCode: varchar("product_code", { length: 50 }),

  hsnCode: varchar("hsn_code", { length: 20 }),

  productType: productTypeEnum("product_type").notNull().default("retail"),

  gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).notNull().default("0"),

  purchasePrice: numeric("purchase_price", { precision: 12, scale: 2 }).notNull().default("0"),

  sellingPrice: numeric("selling_price", { precision: 12, scale: 2 }).notNull().default("0"),

  // wholesalePrice: numeric("wholesale_price", { precision: 12, scale: 2 }),

  // mrp: numeric("mrp", { precision: 12, scale: 2 }),

  isActive: boolean("is_active").notNull().default(true),
  isDeleted: boolean("is_deleted").notNull().default(false),

  stockStatus: stockStatusEnum("stock_status").notNull().default("in_stock"),

  createdAt: timestamp("created_at").notNull().defaultNow().notNull(),

  updatedAt: timestamp("updated_at").notNull().defaultNow().notNull(),
},
(table) => [
    // Product code must be unique within a shop.
    // Case-insensitive and ignores deleted products.
    uniqueIndex("products_shop_code_name_type_unique")
      .on(
        table.shopId,
        // sql`LOWER(TRIM(${table.name}))`,
        sql`LOWER(TRIM(${table.productCode}))`,
        sql`LOWER(TRIM(${table.productType}))`,
      )
      .where(
        sql`${table.productCode} IS NOT NULL
          AND ${table.productType} IS NOT NULL
          AND ${table.isDeleted} = false`,
      ),

    // Shop-based product listing
    index("products_shop_id_idx").on(table.shopId),

    // Category-based product filtering
    index("products_category_id_idx").on(table.categoryId),

    // Product search by name
    index("products_name_search_idx").on(table.shopId, sql`LOWER(${table.name})`),
  ],);