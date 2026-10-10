import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
  boolean,
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

  status: boolean("status").default(true),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});