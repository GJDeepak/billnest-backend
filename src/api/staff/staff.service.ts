
import {
  Injectable, Inject,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";

import { and, desc, eq, sql } from "drizzle-orm";

import { DATABASE } from "../../database/database.module.js";
import { shops } from "../../database/schema/shops.schema.js";
import { staff } from "../../database/schema/staff.schema.js";

import { CreateStaffDto, UpdateStaffDto, } from "./dto/staff.dto.js";

import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";

@Injectable()
export class StaffService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  private async checkShop(userId: string, shopId: string) {
    const [shop] = await this.db
      .select({ id: shops.id })
      .from(shops)
      .where(
        and(
          eq(shops.id, shopId),
          eq(shops.userId, userId),
        ),
      )
      .limit(1);

    if (!shop) {
      throw new NotFoundException("Shop not found!");
    }
  }

  private async checkStaff(shopId: string, staffId: string) {
    const [employee] = await this.db
      .select({ id: staff.id })
      .from(staff)
      .where(
        and(
          eq(staff.id, staffId),
          eq(staff.shopId, shopId),
          eq(staff.isDeleted, false),
        ),
      )
      .limit(1);

    if (!employee) {
      throw new NotFoundException("Staff not found!");
    }
  }

  async createStaff(userId: string, shopId: string, dto: CreateStaffDto, ) {
    try {
      await this.checkShop(userId, shopId);

      const email = dto.email?.trim().toLowerCase() || null;

      const [employee] = await this.db
        .insert(staff)
        .values({
          shopId,
          name: dto.name.trim(),
          mobile: dto.mobile.trim(),
          email,
          ...((dto.role), { role: dto.role}),
        //   role: dto.role ?? "sales_staff",
          joiningDate: dto.joiningDate,
          monthlySalary: dto.monthlySalary,
          ...((dto.status), { status: dto.status}),
        //   status: dto.status ?? "active",
          ...((dto.dutyStatus), { dutyStatus: dto.dutyStatus}),
        //   dutyStatus: dto.dutyStatus ?? "on_duty",
          address: dto.address?.trim() || null,
        })
        .returning();

      return {
        success: true,
        message: "Staff created successfully!",
        data: employee,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async getAllStaff(userId: string, shopId: string) {
    try {
      await this.checkShop(userId, shopId);

      const employees = await this.db
        .select()
        .from(staff)
        .where(
          and(
            eq(staff.shopId, shopId),
            eq(staff.isDeleted, false),
          ),
        )
        .orderBy(desc(staff.createdAt));

      return {
        success: true,
        data: employees,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async getStaffById(
    userId: string,
    shopId: string,
    staffId: string,
  ) {
    try {
      await this.checkShop(userId, shopId);
      await this.checkStaff(shopId, staffId);

      const [employee] = await this.db
        .select()
        .from(staff)
        .where(
          and(
            eq(staff.id, staffId),
            eq(staff.shopId, shopId),
            eq(staff.isDeleted, false),
          ),
        )
        .limit(1);

      return {
        success: true,
        data: employee,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async updateStaff(
    userId: string,
    shopId: string,
    staffId: string,
    dto: UpdateStaffDto,
  ) {
    try {
      await this.checkShop(userId, shopId);
      await this.checkStaff(shopId, staffId);

      const updateData: Record<string, any> = {};

      for (const [key, value] of Object.entries(dto)) {
        if (value !== undefined) {
          updateData[key] = value;
        }
      }

      if (typeof dto.name === "string") {
        updateData.name = dto.name.trim();
      }

      if (typeof dto.mobile === "string") {
        updateData.mobile = dto.mobile.trim();
      }

      if (dto.email !== undefined) {
        updateData.email =
          dto.email?.trim().toLowerCase() || null;
      }

      if (typeof dto.address === "string") {
        updateData.address = dto.address.trim();
      }

      const [employee] = await this.db
        .update(staff)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(staff.id, staffId),
            eq(staff.shopId, shopId),
            eq(staff.isDeleted, false),
          ),
        )
        .returning();

      return {
        success: true,
        message: "Staff updated successfully!",
        data: employee,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async deleteStaff(
    userId: string,
    shopId: string,
    staffId: string,
  ) {
    try {
      await this.checkShop(userId, shopId);

      const [employee] = await this.db
        .update(staff)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(staff.id, staffId),
            eq(staff.shopId, shopId),
            eq(staff.isDeleted, false),
          ),
        )
        .returning({
          id: staff.id,
          name: staff.name,
        });

      if (!employee) {
        throw new NotFoundException(
          "Staff not found or already deleted!",
        );
      }

      return {
        success: true,
        message: "Staff deleted successfully!",
        data: employee,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }
}