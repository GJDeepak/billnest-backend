
import {
  pgTable,  pgEnum, uuid, varchar, boolean,
  date, timestamp, numeric, text,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";

// Employee role
export const staffRoleEnum = pgEnum("staff_role", ["manager",  "sales_staff", "cashier", "accountant", "stock_manager", "other"]);

// Employment status
export const staffStatusEnum = pgEnum("staff_status", ["active", "inactive", "resigned", "terminated"]);

// Current duty status
export const dutyStatusEnum = pgEnum("duty_status", ["on_duty", "off_duty"]);

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),

  shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 100 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  email: varchar("email", { length: 150 }),

  role: staffRoleEnum("role").default("sales_staff").notNull(),

  joiningDate: date("joining_date").notNull(),

  monthlySalary: numeric("monthly_salary", { precision: 12, scale: 2 }).notNull(),

  status: staffStatusEnum("status").default("active").notNull(),

  dutyStatus: dutyStatusEnum("duty_status").default("on_duty").notNull(),

  address: text("address"),

  isDeleted: boolean("is_deleted").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});