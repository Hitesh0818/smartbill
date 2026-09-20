import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
@Injectable() export class AuthService {
  constructor(private prisma:PrismaService, private jwt:JwtService) {}
  async login(email:string,password:string) {
    const user = await this.prisma.user.findUnique({ where:{email}, include:{memberships:{include:{firm:true}}} });
    if (!user || !(await bcrypt.compare(password,user.passwordHash))) throw new UnauthorizedException("Invalid email or password");
    const firms = user.memberships.map(m => ({ id:m.firm.id, name:m.firm.name, role:m.role }));
    const token = await this.jwt.signAsync({ sub:user.id, email:user.email });
    return { accessToken:token, user:{id:user.id,name:user.name,email:user.email}, firms };
  }
}
