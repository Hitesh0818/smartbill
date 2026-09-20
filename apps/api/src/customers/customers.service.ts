import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { FirmsService } from "../firms/firms.service";

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firms: FirmsService,
  ) {}

  async list(userId: string, firmId: string) {
    await this.firms.assertMember(userId, firmId);
    return this.prisma.customer.findMany({
      where: { firmId },
      orderBy: { name: "asc" },
    });
  }

  async create(userId: string, firmId: string, data: any) {
    await this.firms.assertMember(userId, firmId);
    return this.prisma.customer.create({ data: { ...data, firmId } });
  }
}