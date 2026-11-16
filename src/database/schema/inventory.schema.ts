import { integer, pgTable, serial, timestamp, uuid, boolean, pgEnum, numeric } from "drizzle-orm/pg-core";

import { products } from "./products.schema.js";
import { branches } from "./branches.schema.js";

export const productUnitsEnum = pgEnum("unit", [
  "kg", "g", "mg", "l", "ml", "pcs",
  "box", "pack", "dozen", "bottle",
]);

export const inventory = pgTable("inventory", {
  // id: serial("id").primaryKey(),
  // productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  // branchId: integer("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),

  id: uuid("id").primaryKey().defaultRandom(),

  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),

  branchId: uuid("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),

  quantity: numeric("quantity", { precision: 14, scale: 3 }).default("0"),
  
  unit: productUnitsEnum("unit").default("pcs"),

  isDeleted: boolean("is_deleted").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});