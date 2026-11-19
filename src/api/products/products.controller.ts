
import {
  Body, Controller, Delete, Get, Param,
  Patch, Post, Query, Req, UseGuards,
} from "@nestjs/common";

import { JwtAuthGuard } from "../../utils/guards/jwt-auth.guard.js";
import { ProductsService } from "./products.service.js";
import { CreateProductDto, UpdateProductDto } from "./dto/product.dto.js";

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService,) {}

  // Create or update product
  @Post()
  async createOrUpdateProduct(
    @Req() req: any,
    // @Query("shopId") shopId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createOrUpdateProduct(req.user.userId, req.user.shopId, dto);
  }

  // Get all products
  @Get("all")
  async getProducts(
    @Req() req: any,
    // @Query("shopId") shopId: string,
    @Query("search") search?: string,
    @Query("categoryId") categoryId?: string,
  ) {
    return this.productsService.getProducts(req.user.userId, req.user.shopId, search, categoryId);
  }

  // Get product by ID
  @Get(":id")
  async getProductById(
    @Req() req: any,
    // @Query("shopId") shopId: string,
    @Param("id") productId: string,
  ) {
    return this.productsService.getProductById(req.user.userId, req.user.shopId, productId);
  }

  // Update product
  @Patch(":id")
  async updateProduct(
    @Req() req: any,
    // @Query("shopId") shopId: string,
    @Param("id") productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(req.user.userId, req.user.shopId, productId, dto);
  }

  // Soft delete product
  @Delete(":id")
  async deleteProduct(
    @Req() req: any,
    // @Query("shopId") shopId: string,
    @Param("id") productId: string,
  ) {
    return this.productsService.deleteProduct(req.user.userId, req.user.shopId, productId);
  }

  // Reactivate deleted product
  @Patch(":id/reactivate")
  async reActivateProduct(
    @Req() req: any,
    // @Query("shopId") shopId: string,
    @Param("id") productId: string,
  ) {
    return this.productsService.reActivateProduct(req.user.userId, req.user.shopId, productId);
  }
}
