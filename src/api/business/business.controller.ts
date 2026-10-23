import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";

import { JwtAuthGuard } from "../../utils/guards/jwt-auth.guard.js";
import { BusinessService } from "./business.service.js";
import { BusinessSetupDto } from "./dto/business-setup.dto.js";

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@Controller("business")
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
  ) {}

  @Post("setup")
  setupBusiness(
    @Req() req: AuthenticatedRequest,
    @Body() dto: BusinessSetupDto,
  ) {
    return this.businessService.setupBusiness(req.user.userId, dto);
  }

  // @Get()
  // getMyBusiness(@Req() req: AuthenticatedRequest) {
  //   return this.businessService.getMyBusiness(req.user.userId);
  // }
}

