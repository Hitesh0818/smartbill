import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FirmsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.firmMember.findMany({
      where: { userId },
      include: { firm: true },
    });
  }

  async assertMember(userId: string, firmId: string) {
    const member = await this.prisma.firmMember.findUnique({
      where: { firmId_userId: { firmId, userId } },
    });
    if (!member) {
      throw new ForbiddenException("You do not have access to this firm");
    }
    return member;
  }

  async get(userId: string, firmId: string) {
    await this.assertMember(userId, firmId);
    const firm = await this.prisma.firm.findUnique({ where: { id: firmId } });
    if (!firm) {
      throw new NotFoundException("Firm not found");
    }
    return firm;
  }
}