import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { products } from "./products.schema.js";
import { branches } from "./branches.schema.js";

export const stockMovementType = pgEnum("stock_movement_type", [
  "purchase",
  "sale",
  "return",
  "adjustment",
  "damage",
  "transfer",
]);

export const stockMovements = pgTable("stock_movements", {
  id: serial("id").primaryKey(),

  productId: integer("product_id")
    .notNull()
    .references(() => products.id, {
      onDelete: "cascade",
    }),

  branchId: integer("branch_id")
    .notNull()
    .references(() => branches.id, {
      onDelete: "cascade",
    }),

  movementType: stockMovementType("movement_type")
    .notNull(),

  quantity: integer("quantity")
    .notNull(),

  referenceId: integer("reference_id"),

  reason: text("reason"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});