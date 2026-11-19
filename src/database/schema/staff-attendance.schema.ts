
import {
  pgTable, pgEnum, uuid, date, time,
  timestamp, text, uniqueIndex,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { staff } from "./staff.schema.js";

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "half_day",
  "leave",
  "holiday",
  "on_duty",
]);

export const staffAttendance = pgTable("staff_attendance", {
    id: uuid("id").primaryKey().defaultRandom(),

    shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

    staffId: uuid("staff_id").notNull().references(() => staff.id, { onDelete: "cascade" }),

    attendanceDate: date("attendance_date").notNull(),

    status: attendanceStatusEnum("status").notNull(),

    checkIn: time("check_in"),
    checkOut: time("check_out"),

    note: text("note"),

    createdAt: timestamp("created_at").notNull().defaultNow().notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().notNull(),
},
(table) => [
    uniqueIndex("staff_attendance_date_unique").on(
        table.staffId,
        table.attendanceDate,
    ),
],);