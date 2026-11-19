import { pgTable, timestamp, varchar, boolean, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"

import { shops } from "./shops.schema.js";

export const categories = pgTable("categories", {
  // id: serial("id").primaryKey(),
  // shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade"}),

  id: uuid("id").primaryKey().defaultRandom(),

  shopId: uuid("shop_id").notNull().references(() => shops.id, { onDelete: "cascade"}),

  name: varchar("name", { length: 100  }).notNull(),
  
  description: varchar("description", { length: 255 }),

  isActive: boolean("is_active").notNull().default(true),
  
  isDeleted: boolean("is_deleted").notNull().default(false),

  createdAt: timestamp("created_at").notNull().defaultNow().notNull(),

  updatedAt: timestamp("updated_at").notNull().defaultNow().notNull(),
},
(table) => [
    uniqueIndex("categories_shop_name_lower_unique").on(
      table.shopId,
      sql`lower(${table.name})`,
    ),
  ],
);