
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";

import { Request } from "express";

import { JwtAuthGuard } from "../../utils/guards/jwt-auth.guard.js";
import { SalesService } from "./sales.service.js";
import { CreateSaleDto } from "./dto/sales.dto.js";

@Controller("sales")
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
  ) {}

  // Create retail / wholesale sale
  @Post()
  async createSale(
    @Req() req: any,
    // @Query("shopId") shopId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.salesService.createSale(req.user.userId, req.user.shopId, dto);
  }
}
