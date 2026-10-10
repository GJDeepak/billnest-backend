
import {
  boolean, integer, pgTable,
  serial, timestamp, unique,
  varchar, text, pgEnum,
} from "drizzle-orm/pg-core";

import { shops } from "./shops.schema.js";
import { branches } from "./branches.schema.js";

export const categoryTypeEnum = pgEnum("category_type", ["added", "removed", "updated"]);

export const unitTypeEnum = pgEnum("unit_type", [
    "kg", "ton", "mm", "cm", "m", "ml", "l", "pieces", "dozen", "box", "packs", "set", "pair", "bottle", "can", "jar", "tube", "roll", "sheet", "bag", "carton", "crate", "sachet"
]);

export const stockStatusEnum = pgEnum("stock_status", ["in_stock", "low_stock", "out_of_stock"]);

export const storeRooms = pgTable("store_rooms", {
    id: serial("id").primaryKey(),

    shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" }),

    branchId: integer("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 150 }).notNull(),

    code: varchar("code", { length: 50 }).notNull(),

    description: text("description"),

    receiveCount: integer("receive_count").default(0),
    issueCount: integer("issue_count").default(0),
    wastageCount: integer("wastage_count").default(0),

    currentStock: integer("current_stock").default(0),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
},
(table) => [
    unique("store_rooms_branch_code_unique").on(table.branchId,table.code),
],
);

export type StoreRoom = typeof storeRooms.$inferSelect;
export type NewStoreRoom = typeof storeRooms.$inferInsert;