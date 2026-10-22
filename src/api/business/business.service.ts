import { ConflictException, Injectable, Inject } from "@nestjs/common";

import { DATABASE } from "../../database/database.module.js";
import { shops } from "../../database/schema/shops.schema.js";
import { branches } from "../../database/schema/branches.schema.js";

import { BusinessSetupDto } from "./dto/business-setup.dto.js";
import { eq } from "drizzle-orm";
import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";

@Injectable()
export class BusinessService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  async create(userId: number, dto: BusinessSetupDto) {

    try {
        return { userId, dto};
        const [existingShop] = await this.db.selet().from(shops).where(eq(shops.userId, userId)).limit(1);
        if (existingShop.businessSetup) throw new ConflictException("Business already steup completed! Check and update your business details");

    } catch (error) {
        handleDatabaseError(error);
    }
  }

  async getMyBusiness(userId: number) {
    const [shop] = await this.db
      .select()
      .from(shops)
      .where(eq(shops.userId, userId))
      .limit(1);

    if (!shop) {
      return {
        message: "Business setup has not been completed",
        business: null,
      };
    }

    const shopBranches = await this.db
      .select()
      .from(branches)
      .where(eq(branches.shopId, shop.id));

    return {
      business: shop,
      branches: shopBranches,
    };
  }
}
