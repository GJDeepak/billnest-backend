import {
  Body, Controller, Get, Post, Patch,
  Req, Param, UseGuards, ParseUUIDPipe,
  Delete
} from "@nestjs/common";
import type { Request } from "express";

import { JwtAuthGuard } from "../../utils/guards/jwt-auth.guard.js";
import { CategoriesService } from "./categories.service.js";
import { createCategoryDto, UpdateCategoryByIdDto } from "./dto/categories.dto.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    shopId: string;
  };
};

@Controller()
@UseGuards(JwtAuthGuard)
export class CategoriesController {
    constructor(
        private readonly categoryService: CategoriesService
    ){}

    @Post("category")
    createCategory(
        @Req() req: AuthenticatedRequest,
        @Body() dto: createCategoryDto,
    ) {
        return this.categoryService.createCategory(req.user.userId, req.user.shopId, dto)
    }

    @Get("categories/all")
    getAllCategoriesByShopId( @Req() req: AuthenticatedRequest ){
        return this.categoryService.getAllCategoriesByShopId(req.user.userId, req.user.shopId)
    }

    @Get("category/:id")
    getCategoryById(@Param("id", ParseUUIDPipe) categoryId: string ) {
        return this.categoryService.getCategoryById(categoryId);
    }

    @Patch("category/:id")
    updateCategoryById(
        @Param("id", ParseUUIDPipe) categoryId: string,
        @Body() dto: UpdateCategoryByIdDto,
    ) {
        return this.categoryService.updateCategoryById(categoryId, dto);
    }

    @Delete("category/:id")
    deleteCategoryById(@Param("id", ParseUUIDPipe) categoryId: string) {
        return this.categoryService.deleteCategoryById(categoryId);
    }
}
