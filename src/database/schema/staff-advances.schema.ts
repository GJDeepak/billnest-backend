
import {
  pgTable, pgEnum, uuid, numeric,
  date, text, timestamp,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { staff } from "./staff.schema.js";

export const advanceStatusEnum = pgEnum("staff_advance_status", [
  "pending",
  "approved",
  "rejected",
  "partially_paid",
  "paid",
]);

export const staffAdvances = pgTable("staff_advances", {
  id: uuid("id").primaryKey().defaultRandom(),

  shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

  staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),

  advanceDate: date("advance_date").notNull(),

  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),

  repaidAmount: numeric("repaid_amount", { precision: 12, scale: 2, }).default("0").notNull(),

  status: advanceStatusEnum("status").default("pending").notNull(),

  reason: text("reason"),

  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// outstanding = amount - repaidAmount;