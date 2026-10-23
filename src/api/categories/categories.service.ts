import { Injectable, Inject, ConflictException, NotFoundException, BadRequestException } from "@nestjs/common";
import { eq, and, ilike, count, asc, ne } from "drizzle-orm";

import { DATABASE } from "../../database/database.module.js";
import { shops } from "../../database/schema/shops.schema.js";
import { categories } from "../../database/schema/categories.schema.js"
import { products } from "../../database/schema/products.schema.js";

import { createCategoryDto, UpdateCategoryByIdDto } from "./dto/categories.dto.js"
import { handleDatabaseError } from "../../utils/errors/database-error.handler.js";
import { removeEmptyValues } from "../../utils/functions/common.js";

@Injectable()
export class CategoriesService {
    constructor(
        @Inject(DATABASE)
        private readonly db: any,
    ) {}

    async createCategory(userId: string, shopId: string, dto: createCategoryDto,) {
        try {
            const [[shop], [existCategory]] = await Promise.all([
                this.db.select().from(shops).where(eq(shops.userId, userId)).limit(1),
                this.db.select().from(categories).where(and(eq(categories.shopId, shopId), ilike(categories.name, dto.name.trim())))
            ])
            // const [shop] = await this.db.select().from(shops).where(eq(shops.userId, userId)).limit(1);
            if (!shop) throw new NotFoundException("Business or Sho details not found for you!");
            if (existCategory) throw new ConflictException("Category name already exists! Try a different name.");

            const insertData = { ...removeEmptyValues(dto), shopId: shop.id }
            // const returningObj = { id: categories.id, name: categories.name, description: categories.description, shopId: categories.shopId }

            const [category] = await this.db.insert(categories).values(insertData).returning({ id: categories.id })

            return { success: true, category, message: `${dto.name} category created sucessfull!` }
        } catch (error) {
           handleDatabaseError(error) 
        }
    }

    async getAllCategoriesByShopId(userId: string, shopId: string) {
        try {
            const [[shop], result] = await Promise.all([
                this.db.select({ id: shops.id }).from(shops).where(and(eq(shops.id, shopId), eq(shops.userId, userId))).limit(1),

                // Get all categories with products counts
                this.db.select({
                    id: categories.id,
                    name: categories.name,
                    description: categories.description,
                    isActive: categories.isActive,
                    productsCount: count(products.id),
                })
                .from(categories)
                .leftJoin(products, eq(products.categoryId, categories.id))
                .where(and(eq(categories.shopId, shopId), eq(categories.isDeleted, false)))
                .groupBy(categories.id)
                .orderBy(asc(categories.name)),
            ]);

            if (!shop) throw new NotFoundException("Shop details not found!")

            return { success: true, categories: result, totalCategories: result.length };
        } catch (error) {
            handleDatabaseError(error);
        }
    }

    async getCategoryById(categoryId: string) {
        try {
            const [category] = await this.db.select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
                isActive: categories.isActive,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
                productsCount: count(products.id),
            })
            .from(categories)
            .leftJoin(products, eq(products.categoryId, categories.id))
            .where(eq(categories.id, categoryId))
            .groupBy(categories.id)
            .limit(1);

            if (!category) {
                throw new NotFoundException("Category not found!");
            }

            return { success: true, category, message: "Category details fetched successfully!" };
        } catch (error) {
            handleDatabaseError(error);
        }
    }

    async updateCategoryById(categoryId: string, dto: UpdateCategoryByIdDto) {
        try {
            const [existing] = await this.db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

            if (!existing) {
                throw new NotFoundException("Category data not found!");
            }

            const updateData = removeEmptyValues(dto);

            if (Object.keys(updateData).length === 0) {
                throw new BadRequestException("Provide at least one field to update!");
            }

            if (typeof updateData.name === "string") {
                updateData.name = updateData.name.trim();

                if (!updateData.name) {
                    throw new BadRequestException("Category name cannot be empty!");
                }

                const [duplicate] = await this.db.select({ id: categories.id })
                    .from(categories)
                    .where(
                        and(
                            eq(categories.shopId, existing.shopId),
                            ilike(categories.name, updateData.name),
                            ne(categories.id, categoryId),
                        ),
                    )
                    .limit(1);

                if (duplicate) {
                    throw new ConflictException("Category name already exists!");
                }
            }

            const [category] = await this.db
                .update(categories)
                .set({ ...updateData, updatedAt: new Date() })
                .where(eq(categories.id, categoryId))
                .returning();

            return { success: true, category, message: "Category updated successfully!" };
        } catch (error) {
            handleDatabaseError(error);
        }
    }

    async deleteCategoryById(categoryId: string) {
        try {
            const [category] = await this.db.update(categories)
                .set({ isDeleted: true, updatedAt: new Date()})
                .where(and(eq(categories.id, categoryId), eq(categories.isDeleted, false),))
                .returning({ id: categories.id, name: categories.name });

            if (!category) {
                throw new NotFoundException("Category not found or already deleted!");
            }

            return { success: true, category, message: "Category deleted successfully!" };
        } catch (error) {
            handleDatabaseError(error);
        }
    }
}
