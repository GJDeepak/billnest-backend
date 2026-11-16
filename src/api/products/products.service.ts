
import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";

import {
  and,
  asc,
  desc,
  eq,
  sql,
  ilike,
} from "drizzle-orm";

import { DATABASE } from "../../database/database.module.js";
import { shops } from "../../database/schema/shops.schema.js";
import { categories } from "../../database/schema/categories.schema.js";
import { products } from "../../database/schema/products.schema.js";

import {
  CreateProductDto,
  UpdateProductDto,
} from "./dto/product.dto.js";

import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";

@Injectable()
export class ProductsService {
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

  private async checkCategory(
    shopId: string,
    categoryId: string,
  ) {
    const [category] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.shopId, shopId),
          eq(categories.isDeleted, false),
        ),
      )
      .limit(1);

    if (!category) {
      throw new BadRequestException(
        "Category not found in this shop!",
      );
    }
  }

  private async checkProductCode(
    shopId: string,
    productCode: string,
    excludeProductId?: string,
  ) {
    const conditions = [
      eq(products.shopId, shopId),
      sql`LOWER(${products.productCode}) = ${productCode.toLowerCase()}`,
      eq(products.isDeleted, false),
    ];

    if (excludeProductId) {
      conditions.push(
        sql`${products.id} != ${excludeProductId}`,
      );
    }

    const [existing] = await this.db
      .select({ id: products.id })
      .from(products)
      .where(and(...conditions))
      .limit(1);

    if (existing) {
      throw new ConflictException(
        "Product code already exists in this shop!",
      );
    }
  }

  async createProduct(
    userId: string,
    shopId: string,
    dto: CreateProductDto,
  ) {
    try {
      await this.checkShop(userId, shopId);

      const categoryId = dto.categoryId || null;
      const productCode = dto.productCode?.trim() || null;

      if (categoryId) {
        await this.checkCategory(shopId, categoryId);
      }

      if (productCode) {
        await this.checkProductCode(shopId, productCode);
      }

      const [product] = await this.db
        .insert(products)
        .values({
          shopId,
          categoryId,
          name: dto.name.trim(),
          productCode,
          hsnCode: dto.hsnCode?.trim() || null,
          gstRate: dto.gstRate ?? "0",
          purchasePrice: dto.purchasePrice ?? "0",
          sellingPrice: dto.sellingPrice ?? "0",
          note: dto.note?.trim() || null,
          isActive: dto.isActive ?? true,
        })
        .returning();

      return {
        success: true,
        message: "Product created successfully!",
        data: product,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async getAllProducts(
    userId: string,
    shopId: string,
    page = 1,
    limit = 20,
  search?: string,
  categoryId?: string,
  isActive?: boolean,
  sortBy: "name" | "createdAt" = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
  ) {
    try {
      await this.checkShop(userId, shopId);

      const offset = (page - 1) * limit;

      const conditions: any[] = [
        eq(products.shopId, shopId),
        eq(products.isDeleted, false),
      ];

      if (search?.trim()) {
        conditions.push(
          ilike(products.name, `%${search.trim()}%`),
        );
      }

      if (categoryId) {
        conditions.push(eq(products.categoryId, categoryId));
      }

      if (isActive !== undefined) {
        conditions.push(eq(products.isActive, isActive));
      }

      const orderColumn =
        sortBy === "name" ? products.name : products.createdAt;

      const result = await this.db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(
          sortOrder === "asc"
            ? asc(orderColumn)
            : desc(orderColumn),
        )
        .limit(limit)
        .offset(offset);

      const [{ total }] = await this.db
        .select({ total: sql<number>`count(*)::int` })
        .from(products)
        .where(and(...conditions));

      return {
        success: true,
        data: result,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async getProductById(
    userId: string,
    shopId: string,
    productId: string,
  ) {
    try {
      await this.checkShop(userId, shopId);

      const [product] = await this.db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shopId),
            eq(products.isDeleted, false),
          ),
        )
        .limit(1);

      if (!product) {
        throw new NotFoundException("Product not found!");
      }

      return {
        success: true,
        data: product,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async updateProduct(
    userId: string,
    shopId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    try {
      await this.checkShop(userId, shopId);

      const [existing] = await this.db
        .select({ id: products.id })
        .from(products)
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shopId),
            eq(products.isDeleted, false),
          ),
        )
        .limit(1);

      if (!existing) {
        throw new NotFoundException("Product not found!");
      }

      if (dto.categoryId) {
        await this.checkCategory(shopId, dto.categoryId);
      }

      const productCode =
        dto.productCode === undefined
          ? undefined
          : dto.productCode?.trim() || null;

      if (productCode) {
        await this.checkProductCode(
          shopId,
          productCode,
          productId,
        );
      }

      const updateData: Record<string, any> = {};

      for (const [key, value] of Object.entries(dto)) {
        if (value !== undefined) {
          updateData[key] = value;
        }
      }

      if (dto.name !== undefined) {
        updateData.name = dto.name.trim();
      }

      if (dto.productCode !== undefined) {
        updateData.productCode = productCode;
      }

      if (dto.hsnCode !== undefined) {
        updateData.hsnCode = dto.hsnCode.trim() || null;
      }

      if (dto.note !== undefined) {
        updateData.note = dto.note.trim() || null;
      }

      if (dto.categoryId !== undefined) {
        updateData.categoryId = dto.categoryId || null;
      }

      const [product] = await this.db
        .update(products)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shopId),
            eq(products.isDeleted, false),
          ),
        )
        .returning();

      return {
        success: true,
        message: "Product updated successfully!",
        data: product,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }

  async deleteProduct(
    userId: string,
    shopId: string,
    productId: string,
  ) {
    try {
      await this.checkShop(userId, shopId);

      const [product] = await this.db
        .update(products)
        .set({
          isDeleted: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shopId),
            eq(products.isDeleted, false),
          ),
        )
        .returning({
          id: products.id,
          name: products.name,
        });

      if (!product) {
        throw new NotFoundException(
          "Product not found or already deleted!",
        );
      }

      return {
        success: true,
        message: "Product deleted successfully!",
        data: product,
      };
    } catch (error) {
      handleDatabaseError(error);
      throw error;
    }
  }
}
