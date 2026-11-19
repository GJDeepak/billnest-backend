
import {
  pgTable, pgEnum, uuid, date,
  numeric, text, timestamp,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { staff } from "./staff.schema.js";

export const leaveTypeEnum = pgEnum("staff_leave_type", [
  "casual",
  "sick",
  "earned",
  "unpaid",
  "other",
]);

export const leaveStatusEnum = pgEnum("staff_leave_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const staffLeaves = pgTable("staff_leaves", {
  id: uuid("id").primaryKey().defaultRandom(),

  shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),

  leaveType: leaveTypeEnum("leave_type").notNull(),

  fromDate: date("from_date").notNull(),
  toDate: date("to_date").notNull(),

  totalDays: numeric("total_days", { precision: 5, scale: 2 }).notNull(),

  reason: text("reason"),

  status: leaveStatusEnum("status").notNull().default("pending").notNull(),

  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),

  createdAt: timestamp("created_at").notNull().defaultNow().notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().notNull(),
});