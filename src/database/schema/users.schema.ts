import { pgTable, pgEnum, serial, varchar, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin", "user", "vendor",
  // "staff",
]);
export const businessTypeEnum = pgEnum("business_type", [
  "bakery", "grocery", "supermarket", "restaurant",
  "retail", "wholesale","pharmacy", "other",
]);

export const users = pgTable("users", {
  // id: serial("id").primaryKey(),
  id: uuid("id").primaryKey().defaultRandom(),

  shopName: varchar("shop_name", { length: 100 }).notNull(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 150 }).notNull().unique(),

  password: varchar("password", { length: 255 }).notNull(),

  mobile: varchar("mobile").notNull(),
  countryCode: varchar("country_code", { length: 5 }).notNull().default("+91"),

  businessType: businessTypeEnum("business_type").notNull().default("other"),

  userRole: userRoleEnum("user_role").notNull().default("user"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }),
  address: varchar("address", { length: 255 }),
  pincode: varchar("pincode", { length: 255 }),

  termsAccepted: boolean("terms_accepted").notNull().default(false),

  isDeleted: boolean("is_deleted").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow().notNull(),

  updatedAt: timestamp("updated_at").notNull().defaultNow().notNull(),
});