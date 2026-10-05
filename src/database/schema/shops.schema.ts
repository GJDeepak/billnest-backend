import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  timestamp,
  integer
} from "drizzle-orm/pg-core";

import { users } from "./users.schema.js";

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  shopName: varchar("shop_name", {
    length: 150,
  }).notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});