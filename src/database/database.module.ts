import { Global, Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const DATABASE = "BillNest";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: async () => {
        console.log("DATABASE_URL:", process.env.DATABASE_URL);
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });

        await pool.query("SELECT 1");

        console.log("PostgreSQL connected successfully");

        return drizzle(pool);
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}