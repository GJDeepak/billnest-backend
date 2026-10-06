import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { AuthController } from "../auth/auth.controller.js";
import { AuthService } from "../auth/auth.service.js";

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: "7d",
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
