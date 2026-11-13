import { ConflictException,  Injectable, NotFoundException, Inject } from "@nestjs/common";
import { and, desc, eq, sql } from "drizzle-orm";

import { shops } from "../../database/schema/shops.schema.js";
import { vendors } from "../../database/schema/vendors.schema.js";

import { DATABASE } from "../../database/database.module.js";
import { CreateVendorDto, UpdateVendorDto } from "./dto/vendor.dto.js";

import { removeEmptyValues } from "../../utils/functions/common.js";
import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";

@Injectable()
export class VendorsService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  private async checkShopOwnership(userId: string, shopId: string) {
    const [shop] = await this.db
      .select({ id: shops.id })
      .from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.userId, userId)))
      .limit(1);

    if (!shop) {
      throw new NotFoundException("Shop details not found!");
    }
  }

  private async checkEmailExists(shopId: string, email: string, excludeVendorId?: string) {
    const conditions = [
      eq(vendors.shopId, shopId),
      sql`LOWER(${vendors.email}) = ${email}`,
      eq(vendors.isDeleted, false),
    ];

    if (excludeVendorId) {
      conditions.push(sql`${vendors.id} != ${excludeVendorId}`,);
    }

    const [existingVendor] = await this.db
      .select({ id: vendors.id })
      .from(vendors)
      .where(and(...conditions))
      .limit(1);

    if (existingVendor) {
      throw new ConflictException("Vendor with this email already exists!");
    }
  }

  async createVendor(userId: string, shopId: string, dto: CreateVendorDto) {
    try {
      const email = dto.email?.trim().toLowerCase() || null;

      if (email) {
        await Promise.all([
          this.checkShopOwnership(userId, shopId),
          this.checkEmailExists(shopId, email),
        ]);
      } else {
        await this.checkShopOwnership(userId, shopId);
      }

      const [vendor] = await this.db
        .insert(vendors)
        .values({
          shopId, name: dto.name.trim(), mobile: dto.mobile.trim(), email,
          contactPerson: dto.contactPerson?.trim() || null,
          gstNumber: dto.gstNumber?.trim() || null,
          address: dto.address?.trim() || null,
          creditLimit: (dto.creditLimit) ?? "0",
          openingBalance: (dto.openingBalance) ?? "0",
          paymentTerms: (dto.paymentTerms) ?? "immediate",
          termsAccepted: (dto.termsAccepted) ?? false,
        })
        .returning();

      return { success: true, message: "Vendor created successfully!", data: vendor };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async getAllVendors(userId: string, shopId: string) {
    try {
      await this.checkShopOwnership(userId, shopId);

      console.log("shopId", shopId);
      

      const result = await this.db
        .select()
        .from(vendors)
        .where(and(eq(vendors.shopId, shopId), eq(vendors.isDeleted, false)))
        .orderBy(desc(vendors.createdAt));

      return { success: true, data: result, message: "All the vendors details fetch sucessfully!" };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async getVendorById(userId: string, shopId: string, vendorId: string) {
    try {
      await this.checkShopOwnership(userId, shopId);

      const [vendor] = await this.db
        .select()
        .from(vendors)
        .where(and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId)))
        .limit(1);

      if (!vendor) {
        throw new NotFoundException("Vendor not found!");
      }

      if (!vendor.isDeleted) {
        throw new NotFoundException("Vendor not found or has been deleted!");
      }

      return { success: true, data: vendor, message: "The vendor details fetch sucessfully!"};
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async updateVendor(userId: string, shopId: string, vendorId: string, dto: UpdateVendorDto) {
    try {
      await this.checkShopOwnership(userId, shopId);

      const [existingVendor] = await this.db
        .select({ id: vendors.id })
        .from(vendors)
        .where(and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId), eq(vendors.isDeleted, false)))
        .limit(1);

      if (!existingVendor) {
        throw new NotFoundException("Vendor not found!");
      }

      const updateData = removeEmptyValues(dto);

      if (dto.email) {
        const email = dto.email.trim().toLowerCase();

        if (email) {
          await this.checkEmailExists(shopId, email, vendorId);
        }

        Object.assign(updateData, { email: email || null });
      }

      if (typeof dto.name === "string") {
        updateData.name = dto.name.trim();
      }

      if (typeof dto.contactPerson === "string") {
        updateData.contactPerson = dto.contactPerson.trim();
      }

      if (typeof dto.mobile === "string") {
        updateData.mobile = dto.mobile.trim();
      }

      if (typeof dto.gstNumber === "string") {
        updateData.gstNumber = dto.gstNumber.trim();
      }

      if (typeof dto.address === "string") {
        updateData.address = dto.address.trim();
      }

      const [updatedVendor] = await this.db
        .update(vendors)
        .set({ ...updateData, updatedAt: new Date()})
        .where(and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId), eq(vendors.isDeleted, false)))
        .returning();

      return { success: true, message: "Vendor updated successfully!", data: updatedVendor };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async deleteVendor(userId: string, shopId: string, vendorId: string) {
    try {
      await this.checkShopOwnership(userId, shopId);

      const [deletedVendor] = await this.db
        .update(vendors)
        .set({ isDeleted: true, updatedAt: new Date()})
        .where(and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId), eq(vendors.isDeleted, false), ))
        .returning({ id: vendors.id, name: vendors.name });

      if (!deletedVendor) {
        throw new NotFoundException("Vendor not found or already deleted!");
      }

      return { success: true, message: "Vendor deleted successfully!", data: deletedVendor };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}