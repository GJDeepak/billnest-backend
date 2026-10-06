import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "user",
  "vendor",
  // "staff",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  shopName: varchar("shop_name", {
    length: 100,
  }).notNull(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  email: varchar("email", {
    length: 150,
  }).notNull().unique(),

  password: varchar("password", {
    length: 255,
  }).notNull(),

  userRole: userRoleEnum("user_role").default("user"),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 255 }),
  country: varchar("country", { length: 255 }),
  location: varchar("location", { length: 255 }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});