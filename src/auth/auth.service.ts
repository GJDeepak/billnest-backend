import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

import { DATABASE } from "../database/database.module.js";
import { users } from "../database/schema/users.schema.js";
import { shops } from "../database/schema/shops.schema.js";
import { branches } from "../database/schema/branches.schema.js";

import { eq } from "drizzle-orm";

import { SignupDto } from "./dto/signup.dto.js";
import { SigninDto } from "./dto/signin.dto.js";

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE)
    private readonly db: any,

    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {

    try {
      const existingUser = await this.db
        .select()
        .from(users)
        .where(eq(users.email, dto.email));
    
      if (existingUser.length > 0) {
        throw new ConflictException("Email already exists");
      }
    
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const address = {
        ...(dto.city && {city: dto.city}),
        ...(dto.state && {state: dto.state}),
        ...(dto.country && {country: dto.country}),
        ...(dto.location && {location: dto.location}),
      };

      const insertUserData = {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        shopName: dto.shopName,
        ...address
      };

      const result = await this.db.transaction(async (tx:any) => {
        // user creation
        const [user] = await tx
        .insert(users)
        .values(insertUserData)
        .returning({ id: users.id, name: users.name, email: users.email, shopName: users.shopName });

        // shop creation
        const [shop] = await tx
        .insert(shops)
        .values({
          userId: user.id,
          shopName: dto.shopName,
        })
        .returning({ id: shops.id, shopName: shops.shopName });

        // branch creation
        const [branch] = await tx
        .insert(branches)
        .values({
          shopId: shop.id,
          branchName: `${dto.shopName} - ${dto.city ?? "Main Branch"}`,
          ...address,
          isDefault: true,
        })
        .returning({ id: branches.id, branchName: branches.branchName, isDefault: branches.isDefault });

        return { user, shop, branch };
      });

      // Generate token after successful transaction
      const accessToken = this.jwtService.sign({
        userId: result.user.id,
        shopId: result.shop.id,
        email: result.user.email,
      });

    return {
      message: "Signup successful",
      ...result,
      accessToken,
    };

    } catch (error: unknown) {
    // Database unique constraint
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new ConflictException("Email already exists");
    }

    throw error;
  }

  }

  async signin(dto: SigninDto) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    const user = result[0];

    if (!user) {
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    const passwordMatch = await bcrypt.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException(
        "Invalid email or password",
      );
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      message: "Signin successful",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },

      accessToken: token,
    };
  }
}