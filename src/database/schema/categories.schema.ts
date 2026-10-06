import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),

  shopId: integer("shop_id")
    .notNull()
    .references(() => shops.id, {
      onDelete: "cascade",
    }),

  name: varchar("name", {
    length: 100,
  }).notNull(),
  
  description: varchar("description", {
    length: 255,
  }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});