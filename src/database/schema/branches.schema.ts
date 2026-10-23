import {
  boolean, integer, pgTable, serial,
  text, timestamp, uuid, varchar,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";

export const branches = pgTable("branches", {
  // id: serial("id").primaryKey(),
  // shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  id: uuid("id").primaryKey().defaultRandom(),

  shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  branchName: varchar("branch_name", { length: 150 }).notNull(),

  city: varchar("city", { length: 100 }).notNull(),

  state: varchar("state", { length: 100 }).notNull(),

  country: varchar("country", { length: 100 }).notNull(),

  address: text("address"),

  isDefault: boolean("is_default").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});