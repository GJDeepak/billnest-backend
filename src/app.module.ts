import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
// import { createObserveModule } from "@nestjs/observe";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";

import { AuthModule } from "./api/auth/auth.module.js";

import { DatabaseModule } from "./database/database.module.js";
import { ProductsModule } from "./api/products/products.module.js";
import { CategoriesModule } from "./api/categories/categories.module.js";
import { BusinessModule } from "./api/business/business.module.js";
import { UsersModule } from "./api/users/users.module.js";
import { ShopsModule } from "./api/shops/shops.module.js";
import { VendorsModule } from "./api/vendors/vendors.module.js";
import { StaffModule } from './api/staff/staff.module.js';
import { SalesModule } from './api/sales/sales.module.js';

// export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  // imports: [
  //   // Distributed tracing, auto-correlated logs, request/job metrics, error
  //   // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
  //   ObserveModule.forRoot({
  //     appKey: "YOUR_APP_KEY",
  //     appSecret: "YOUR_APP_SECRET",
  //     serviceId: "billnest-backend",
  //   }),
  //   AuthModule,
  // ],

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DatabaseModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    BusinessModule,
    UsersModule,
    ShopsModule,
    VendorsModule,
    StaffModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
