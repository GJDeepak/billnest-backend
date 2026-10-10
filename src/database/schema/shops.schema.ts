import {
  pgTable, serial, varchar, timestamp,
  integer, boolean, pgEnum 
} from "drizzle-orm/pg-core";

import { users } from "./users.schema.js";

export const businessTypeEnum = pgEnum("business_type", [
  "bakery", "grocery", "retail", "super_market",
  "restaurant", "wholesale", "pharmacy", "other",
]);

export const billSizeEnum = pgEnum("bill_size", [
  "A4", "A5", "A6", "custom",
  "termal_58mm", "termal_80mm",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "online", "upi"]);

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),

  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  shopName: varchar("shop_name", { length: 150 }).notNull(),

  pincode: varchar("pincode", { length: 10 }),
  gstNumber: varchar("gst_number", { length: 25 }),
  billStartNumber: integer("bill_start_number").default(1),
  billPrefix: varchar("bill_prefix", { length: 25 }),
  billSize: billSizeEnum("bill_size").default("custom"),

  businessType: businessTypeEnum("business_type").default("other"),
  paymentMethod: paymentMethodEnum("payment_method").default("cash"),
  
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }),
  location: varchar("location", { length: 255 }),
  
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});