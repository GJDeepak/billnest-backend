
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";

import { ProductsService } from "./products.service.js";
import {
  CreateProductDto,
  UpdateProductDto,
} from "./dto/product.dto.js";

import { JwtAuthGuard } from "../../utils/guards/jwt-auth.guard.js";

@Controller("products")
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  @Post()
  createProduct(
    @Req() req: any,
    @Query("shopId", ParseUUIDPipe) shopId: string,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(
      req.user.userId,
      shopId,
      dto,
    );
  }

  @Get()
  getAllProducts(
    @Req() req: any,
    @Query("shopId", ParseUUIDPipe) shopId: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query("search") search?: string,
    @Query("categoryId", ParseUUIDPipe) categoryId?: string,
    @Query("isActive") isActive?: string,
    @Query("sortBy") sortBy?: "name" | "createdAt",
    @Query("sortOrder") sortOrder?: "asc" | "desc",
  ) {
    return this.productsService.getAllProducts(
      req.user.userId,
      shopId,
      page,
      Math.min(limit, 100),
      search,
      categoryId,
      isActive === undefined ? undefined : isActive === "true",
      sortBy === "name" ? "name" : "createdAt",
      sortOrder === "asc" ? "asc" : "desc",
    );
  }

  @Get(":id")
  getProductById(
    @Req() req: any,
    @Query("shopId", ParseUUIDPipe) shopId: string,
    @Param("id", ParseUUIDPipe) productId: string,
  ) {
    return this.productsService.getProductById(
      req.user.userId,
      shopId,
      productId,
    );
  }

  @Patch(":id")
  updateProduct(
    @Req() req: any,
    @Query("shopId", ParseUUIDPipe) shopId: string,
    @Param("id", ParseUUIDPipe) productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(
      req.user.userId,
      shopId,
      productId,
      dto,
    );
  }

  @Delete(":id")
  deleteProduct(
    @Req() req: any,
    @Query("shopId", ParseUUIDPipe) shopId: string,
    @Param("id", ParseUUIDPipe) productId: string,
  ) {
    return this.productsService.deleteProduct(
      req.user.userId,
      shopId,
      productId,
    );
  }
}
