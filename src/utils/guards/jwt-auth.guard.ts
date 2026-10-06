import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";

import type { Request } from "express";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    shopId: number;
    email: string;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException("Authorization token is required");
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new UnauthorizedException("Invalid authorization format");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      request.user = {
        userId: payload.userId,
        shopId: payload.shopId,
        email: payload.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}