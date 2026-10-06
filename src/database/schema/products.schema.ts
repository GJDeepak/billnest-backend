import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { categories } from "./categories.schema.js";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),

  shopId: integer("shop_id")
    .notNull()
    .references(() => shops.id, {
      onDelete: "cascade",
    }),

  categoryId: integer("category_id")
    .references(() => categories.id, {
      onDelete: "set null",
    }),

  name: varchar("name", {
    length: 150,
  }).notNull(),

  note: varchar("name", {
    length: 150,
  }).notNull(),

  productCode: varchar("product_code", {
    length: 50,
  }).notNull(),

  hsnCode: varchar("hsn_code", {
    length: 20,
  }),

  gstRate: numeric("gst_rate", {
    precision: 5,
    scale: 2,
  }).notNull().default("0"),

  purchasePrice: numeric("purchase_price", {
    precision: 12,
    scale: 2,
  }),

  sellingPrice: numeric("selling_price", {
    precision: 12,
    scale: 2,
  }).notNull(),

  isActive: boolean("is_active")
    .notNull()
    .default(true),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});