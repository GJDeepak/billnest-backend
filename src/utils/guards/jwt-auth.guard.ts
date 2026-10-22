import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";

import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";

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
    try {
      const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
      
      
      const authHeader = request.headers.authorization;
      
      if (!authHeader) {
        throw new UnauthorizedException("Authorization token is required");
      }
      
      const [type, token] = authHeader.split(" ");
      
      if (type !== "Bearer" || !token) {
        throw new UnauthorizedException(`Invalid authorization format ! Expected "Bearer <token>"`);
      }

      const payload = await this.jwtService.verifyAsync(token);
      
      request.user = {
        userId: payload.userId,
        shopId: payload.shopId,
        email: payload.email,
      };

      return true;
    } catch (error:any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException("Access token has expired");
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException("Invalid access token");
      }

      throw new UnauthorizedException("Token verification failed");
    }
  }
}
