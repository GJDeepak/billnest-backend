
import {
  pgTable, pgEnum, uuid, date, numeric,
  text, timestamp, uniqueIndex,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { staff } from "./staff.schema.js";

export const payrollStatusEnum = pgEnum("staff_payroll_status", ["pending", "paid", "partially_paid"]);

export const staffPayroll = pgTable("staff_payroll", {
    id: uuid("id").primaryKey().defaultRandom(),

    shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

    staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),

    salaryMonth: date("salary_month").notNull(),

    basicSalary: numeric("basic_salary", { precision: 12, scale: 2 }).notNull(),

    allowances: numeric("allowances", { precision: 12, scale: 2 }).default("0"),

    deductions: numeric("deductions", { precision: 12, scale: 2 }).default("0"),

    advanceDeduction: numeric("advance_deduction", { precision: 12, scale: 2 }).default("0"),

    netSalary: numeric("net_salary", { precision: 12, scale: 2 }),

    paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0").notNull(),

    paymentDate: date("payment_date"),

    status: payrollStatusEnum("status").default("pending"),

    note: text("note"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
(table) => [
    uniqueIndex("staff_payroll_month_unique").on(
        table.staffId,
        table.salaryMonth,
    ),
],);