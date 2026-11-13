import {
  Controller, Get, Post, Patch, Delete, Body,
  Query, Param, Req, UseGuards, ParseUUIDPipe,
} from "@nestjs/common";

import { VendorsService } from "./vendors.service.js";
import { CreateVendorDto, UpdateVendorDto } from "./dto/vendor.dto.js";
import { JwtAuthGuard } from "../../utils/guards/jwt-auth.guard.js";

@Controller()
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post("vendors")
  createVendor(
    @Req() req: any,
    // @Query("shopId", ParseUUIDPipe) shopId: string,
    @Body() dto: CreateVendorDto,
  ) {
    return this.vendorsService.createVendor(req.user.userId, req.user.shopId, dto);
  }

  @Get("vendors/all")
  getAllVendors(
    @Req() req: any,
    // @Query("shopId", ParseUUIDPipe) shopId: string,
  ) {
    return this.vendorsService.getAllVendors(req.user.userId, req.user.shopId);
  }

  @Get("vendors/:id")
  getVendorById(
    @Req() req: any,
    // @Query("shopId", ParseUUIDPipe) shopId: string,
    @Param("id", ParseUUIDPipe) vendorId: string,
  ) {
    return this.vendorsService.getVendorById(req.user.userId, req.user.shopId, vendorId);
  }

  @Patch("vendors/:id")
  updateVendor(
    @Req() req: any,
    // @Query("shopId", ParseUUIDPipe) shopId: string,
    @Param("id", ParseUUIDPipe) vendorId: string,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorsService.updateVendor(req.user.userId, req.user.shopId, vendorId, dto);
  }

  @Delete("vendors/:id")
  deleteVendor(
    @Req() req: any,
    // @Query("shopId", ParseUUIDPipe) shopId: string,
    @Param("id", ParseUUIDPipe) vendorId: string,
  ) {
    return this.vendorsService.deleteVendor(req.user.userId, req.user.shopId, vendorId);
  }
}
