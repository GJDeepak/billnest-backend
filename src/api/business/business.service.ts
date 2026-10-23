import { ConflictException, Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DATABASE } from "../../database/database.module.js";
import { shops } from "../../database/schema/shops.schema.js";
import { branches } from "../../database/schema/branches.schema.js";

import { BusinessSetupDto } from "./dto/business-setup.dto.js";
import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";

import { removeEmptyValues } from "../../utils/functions/common.js";

@Injectable()
export class BusinessService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  async setupBusiness(userId: string, dto: BusinessSetupDto) {
    try {
      const [existingShop] = await this.db.select().from(shops).where(eq(shops.userId, userId)).limit(1);
      if (existingShop.businessSetup) throw new ConflictException("Business already steup completed! Check and update your business details");

      const updateData = { ...removeEmptyValues(dto), businessSetup: true };
      
      const [updatedShop] = await this.db.update(shops).set(updateData).where(eq(shops.userId, userId)).returning();
      
      return { updatedShop, message: "Business setup completed successfully" };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // async getMyBusiness(userId: number) {
  //   const [shop] = await this.db
  //     .select()
  //     .from(shops)
  //     .where(eq(shops.userId, userId))
  //     .limit(1);

  //   if (!shop) {
  //     return {
  //       message: "Business setup has not been completed",
  //       business: null,
  //     };
  //   }

  //   const shopBranches = await this.db
  //     .select()
  //     .from(branches)
  //     .where(eq(branches.shopId, shop.id));

  //   return {
  //     business: shop,
  //     branches: shopBranches,
  //   };
  // }
}

