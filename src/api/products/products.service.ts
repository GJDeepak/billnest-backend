
import { BadRequestException, Injectable, NotFoundException, } from "@nestjs/common";

import { Inject } from "@nestjs/common";
import { and, desc, eq, ilike, isNull, sql } from "drizzle-orm";

import { DATABASE } from "../../database/database.module.js";
import { shops } from "../../database/schema/shops.schema.js";
import { branches } from "../../database/schema/branches.schema.js";

import { categories } from "../../database/schema/categories.schema.js";
import { products } from "../../database/schema/products.schema.js";
import { inventory } from "../../database/schema/inventory.schema.js";

import { CreateProductDto, UpdateProductDto, } from "./dto/product.dto.js";

import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,
  ) {}

  // --------------------------------------------------
  // CHECK SHOP OWNERSHIP
  // --------------------------------------------------

  private async checkShop(userId: string, shopId: string) {
    
    const [shop] = await this.db
      .select({ id: shops.id })
      .from(shops)
      .where(and(eq(shops.id, shopId), eq(shops.userId, userId)))
      .limit(1);
      
      // console.log(userId, shopId, shop);
    if (!shop) {
      throw new NotFoundException("Shop not found!");
    }

    return shop;
  }

  // --------------------------------------------------
  // CHECK BRANCH OWNERSHIP
  // --------------------------------------------------

  private async checkBranch(shopId: string, branchId?: string | null) {
    if (!branchId) return;

    const [branch] = await this.db
      .select({ id: branches.id })
      .from(branches)
      .where(and(eq(branches.id, branchId), eq(branches.shopId, shopId)))
      .limit(1);

    if (!branch) {
      throw new BadRequestException("Branch does not belong to this shop!");
    }

    return branch;
  }

  // --------------------------------------------------
  // CHECK CATEGORY OWNERSHIP
  // --------------------------------------------------

  private async checkCategory(shopId: string, categoryId?: string | null) {
    if (!categoryId) return;

    const [category] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.shopId, shopId), eq(categories.isDeleted, false)))
      .limit(1);

    if (!category) {
      throw new BadRequestException("Invalid category!");
    }

    return category;
  }

  // --------------------------------------------------
  // CREATE OR UPDATE PRODUCT
  // --------------------------------------------------
  async createOrUpdateProduct(userId: string, shopId: string, dto: CreateProductDto) {
    try {
      await Promise.all([
        this.checkShop(userId, shopId),
        this.checkCategory(shopId, dto.categoryId),
        ...((dto.branchId) ? [this.checkBranch(shopId, dto.branchId)] : []),
      ])

      return await this.db.transaction(async (tx: any) => {
        let product: any;

        // Find existing product using product code
        if (dto.productCode?.trim()) {
          const [existingProduct] = await tx
            .select()
            .from(products)
            .where(
              and(
                eq(products.shopId, shopId),
                // eq(products.isDeleted, false),
                // sql`LOWER(${products.productCode}) = ${dto.productCode.trim().toLowerCase()}`,
                sql`LOWER(TRIM(${products.productCode})) = ${dto.productCode.trim().toLowerCase()}`,
                sql`LOWER(TRIM(${products.productType})) = ${dto.productType.trim().toLowerCase()}`
              ),
            )
            .limit(1);

          if (existingProduct) {
            const updateData: Record<string, any> = { name: dto.name, updatedAt: new Date() };

            if (dto.categoryId !== undefined) {
              updateData.categoryId = dto.categoryId;
            }

            if (dto.note !== undefined) {
              updateData.note = dto.note;
            }

            if (dto.hsnCode !== undefined) {
              updateData.hsnCode = dto.hsnCode;
            }

            if (dto.productType !== undefined) {
              updateData.productType = dto.productType;
            }

            if (dto.gstRate !== undefined) {
              updateData.gstRate = dto.gstRate;
            }

            if (dto.purchasePrice !== undefined) {
              updateData.purchasePrice = dto.purchasePrice;
            }

            if (dto.sellingPrice !== undefined) {
              updateData.sellingPrice = dto.sellingPrice;
            }

            if (dto.isActive !== undefined) {
              updateData.isActive = dto.isActive;
            }

            if (existingProduct.isDeleted) {
              updateData.isDeleted = false;
            }

            [product] = await tx
              .update(products)
              .set(updateData)
              .where(eq(products.id, existingProduct.id))
              .returning();
          }
        }

        // Create product if it does not exist
        if (!product) {
          [product] = await tx
            .insert(products)
            .values({
              shopId,
              categoryId: dto.categoryId,
              name: dto.name,
              productCode: dto.productCode?.trim() || null,
              hsnCode: dto.hsnCode ?? null,
              productType: dto.productType ?? null,
              gstRate: dto.gstRate ?? "0",
              purchasePrice: dto.purchasePrice ?? "0",
              sellingPrice: dto.sellingPrice ?? "0",
              note: dto.note ?? null,
              isActive: dto.isActive ?? true,
            })
            .returning();
        }

        // Find inventory for shop or branch
        const inventoryCondition = (dto.branchId)? eq(inventory.branchId, dto.branchId): isNull(inventory.branchId);

        const [existingInventory] = await tx
          .select()
          .from(inventory)
          .where(and(eq(inventory.shopId, shopId), eq(inventory.productId, product.id), inventoryCondition))
          .limit(1);

        let stock: any;

        if (!existingInventory) {
          [stock] = await tx
            .insert(inventory)
            .values({
              shopId,
              productId: product.id,
              branchId: (dto.branchId) ?? null,
              quantity: (dto.quantity) ?? "0",
              unit: (dto.unit as any) ?? "pcs",
            })
            .returning();
        } else {
          // Do not replace existing stock quantity
          const inventoryUpdate: Record<string, any> = { isDeleted: false, updatedAt: new Date() };

          if (dto.unit !== undefined) {
            inventoryUpdate.unit = dto.unit;
          }

          [stock] = await tx
            .update(inventory)
            .set(inventoryUpdate)
            .where(eq(inventory.id, existingInventory.id))
            .returning();
        }

        return { success: true, message: "Product saved successfully", product, inventory: stock };
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --------------------------------------------------
  // GET ALL PRODUCTS
  // --------------------------------------------------
  async getProducts(userId: string, shopId: string, search?: string, categoryId?: string) {
    try {
      // await this.checkShop(userId, shopId);

      return await this.db
        .select({
          id: products.id, shopId: products.shopId,
          categoryId: products.categoryId, name: products.name,
          productCode: products.productCode, hsnCode: products.hsnCode,
          productType: products.productType, gstRate: products.gstRate,
          purchasePrice: products.purchasePrice, sellingPrice: products.sellingPrice,
          note: products.note, isActive: products.isActive,
          createdAt: products.createdAt, updatedAt: products.updatedAt,
        })
        .from(products)
        .where(
          and(
            eq(products.shopId, shopId),
            eq(products.isDeleted, false),
            (search) ? ilike(products.name, `%${search}%`): undefined,
            (categoryId) ? eq(products.categoryId, categoryId): undefined,
          ),
        )
        .orderBy(desc(products.createdAt));
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --------------------------------------------------
  // GET PRODUCT BY ID
  // --------------------------------------------------
  async getProductById(userId: string, shopId: string, productId: string) {
    try {
      // await this.checkShop(userId, shopId);

      const [product] = await this.db
        .select()
        .from(products)
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shopId),
            // eq(products.isDeleted, false),
          ),
        )
        .limit(1);

      if (!product) {
        throw new NotFoundException("Product not found!");
      }

      if (product.isDeleted) {
        throw new NotFoundException("Product already deleted!");
      }

      const productInventory = await this.db
        .select({ id: inventory.id, branchId: inventory.branchId, quantity: inventory.quantity, unit: inventory.unit })
        .from(inventory)
        .where(and(eq(inventory.shopId, shopId), eq(inventory.productId, productId), eq(inventory.isDeleted, false)));

      return { success: true, ...product, inventory: productInventory, };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --------------------------------------------------
  // UPDATE PRODUCT
  // --------------------------------------------------
  async updateProduct(userId: string, shopId: string, productId: string, dto: UpdateProductDto) {
    try {
      await Promise.all([
        this.checkShop(userId, shopId),
        this.checkCategory(shopId, dto.categoryId)
      ])

      const [existingProduct] = await this.db
        .select({ id: products.id, isDeleted: products.isDeleted })
        .from(products)
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shopId),
            // eq(products.isDeleted, false),
          ),
        )
        .limit(1);

      if (!existingProduct) {
        throw new NotFoundException("Product not found!");
      } 

      if (existingProduct.isDeleted) {
        throw new NotFoundException("Product already deleted!");
      } 
      console.log({existingProduct});
      

      const updateData: Record<string, any> = { updatedAt: new Date() };

      const allowedFields = [
        "categoryId", "name", "productCode",
        "hsnCode", "productType", "gstRate",
        "purchasePrice", "sellingPrice", "note", "isActive",
      ] as const;

      for (const field of allowedFields) {
        if (dto[field] !== undefined) {
          updateData[field] = dto[field];
        }
      }

      if (typeof updateData.productCode === "string" && updateData.productCode.trim() === "") {
        updateData.productCode = null;
      } else if (typeof updateData.productCode === "string") {
        updateData.productCode = updateData.productCode.trim();
      }

      const [updatedProduct] = await this.db
        .update(products)
        .set(updateData)
        .where(
          and(
            eq(products.id, productId),
            eq(products.shopId, shopId),
            // eq(products.isDeleted, false),
          ),
        )
        .returning();

      return { success: true, message: "Product updated successfully", product: updatedProduct, };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --------------------------------------------------
  // DELETE PRODUCT (SOFT DELETE)
  // --------------------------------------------------
  async deleteProduct(userId: string, shopId: string, productId: string) {
    try {
      // await this.checkShop(userId, shopId);

      const [deletedProduct] = await this.db
        .update(products)
        .set({ isDeleted: true, updatedAt: new Date() })
        .where(and(eq(products.id, productId), eq(products.shopId, shopId)))
        .returning({ id: products.id, });

      if (!deletedProduct) {
        throw new NotFoundException("Product not found!");
      }

      return { success: true, message: "Product deleted successfully", };
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  // --------------------------------------------------
  // REACTIVATE OR UNDO DELETE
  // --------------------------------------------------
  async reActivateProduct(userId: string, shopId: string, productId: string) {
    try { 
      await Promise.all([
        this.checkShop(userId, shopId),
        this.db
          .update(products)
          .set({ isDeleted: false, updatedAt: new Date() })
          .where(and(eq(products.id, productId), eq(products.shopId, shopId)))
          .returning({ id: products.id, })
      ])

      return { success: true, message: "Product activated successfully", };
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
  