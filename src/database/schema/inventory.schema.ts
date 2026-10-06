import {
  integer,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";

import { products } from "./products.schema.js";
import { branches } from "./branches.schema.js";

export const inventory = pgTable("inventory", {
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

  quantity: integer("quantity")
    .notNull()
    .default(0),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});