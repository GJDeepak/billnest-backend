import { pgTable, pgEnum, varchar, boolean, integer, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { sql } from "drizzle-orm";

export const paymentTermsEnum = pgEnum("payment_terms", ["immediate", "15_days", "30_days", "45_days", "60_days"]);

export const vendors = pgTable("vendors", {
  // id: serial("id").primaryKey(),
  id: uuid("id").primaryKey().defaultRandom(),
  
  shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  // vendorName: varchar("vendor_name", { length: 100 }).notNull(),

  name: varchar("name", { length: 100 }).notNull(),

  contactPerson: varchar("contact_person"),

  mobile: varchar("mobile").notNull(),
  
  email: varchar("email", { length: 150 }).unique(),
  
  gstNumber: varchar("gst_number", { length: 25 }),
  
  address: varchar("address", { length: 255 }),
  
  creditLimit: integer("creditLimit").default(0),

  openingBalance: integer("openingBalance").default(0),

  paymentTerms: paymentTermsEnum("payment_terms").default("immediate"),

  termsAccepted: boolean("terms_accepted").default(false),

  isVerified: boolean("is_verified").default(true),

  status: boolean("status").default(true),

  isDeleted: boolean("is_deleted").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, 
(table) => [
  uniqueIndex("vendors_shop_email_unique")
    .on(table.shopId, sql`LOWER(${table.email})`)
    .where(
      sql`${table.email} IS NOT NULL AND ${table.isDeleted} = false`,
    ),
],);