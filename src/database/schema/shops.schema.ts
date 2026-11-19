import {
  pgTable, serial, varchar, timestamp,
  integer, boolean, pgEnum, 
  uuid
} from "drizzle-orm/pg-core";

import { users } from "./users.schema.js";

export const businessTypeEnum = pgEnum("business_type", [
  "bakery", "grocery", "retail", "super_market",
  "restaurant", "wholesale", "pharmacy", "other",
]);

export const billSizeEnum = pgEnum("bill_size", [
  "A4", "A5", "A6",
  "termal_58mm", "termal_80mm",
]);

export const invoiceTypeEnum = pgEnum("invoice_type", ["A4", "A5", "A6"]);

export const paymentMethodEnum = pgEnum("payment_method", ["cash", "card", "online", "upi"]);

export const shops = pgTable("shops", {
  // id: serial("id").primaryKey(),
  // userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),

  shopName: varchar("shop_name", { length: 150 }).notNull(),
  mobile: varchar("mobile").notNull(),
  countryCode: varchar("country_code", { length: 5 }).notNull().default("+91"),

  pincode: varchar("pincode", { length: 10 }),
  gstNumber: varchar("gst_number", { length: 25 }),
  billStartNumber: integer("bill_start_number").notNull().default(1),
  billPrefix: varchar("bill_prefix", { length: 25 }),
  billSize: billSizeEnum("bill_size").notNull().default("termal_58mm"),
  invoiceType: invoiceTypeEnum("invoice_type").notNull().default("A4"),

  businessType: businessTypeEnum("business_type").notNull().default("other"),
  paymentMethod: paymentMethodEnum("payment_method").notNull().default("cash"),
  
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }),
  address: varchar("address", { length: 255 }),
  
  businessSetup: boolean("business_setup").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  
  isDeleted: boolean("is_deleted").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow().notNull(),

  updatedAt: timestamp("updated_at").notNull().defaultNow().notNull(),
});