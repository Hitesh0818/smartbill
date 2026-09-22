import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      include: {
        memberships: {
          include: {
            firm: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const firms = user.memberships.map((membership) => ({
      id: membership.firm.id,
      name: membership.firm.name,
      role: membership.role,
    }));

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      firms,
    };
  }
}