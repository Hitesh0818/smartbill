import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { FirmsService } from "../firms/firms.service";

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firms: FirmsService,
  ) {}

  async summary(userId: string, firmId: string) {
    await this.firms.assertMember(userId, firmId);

    const [sales, receivable, product] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { firmId },
        _sum: { grandTotal: true },
      }),
      this.prisma.invoice.aggregate({
        where: { firmId },
        _sum: { balanceDue: true },
      }),
      this.prisma.product.aggregate({
        where: { firmId },
        _sum: { currentStock: true },
      }),
    ]);

    const lowStock = await this.prisma.product.count({
      where: { firmId, reorderLevel: { not: null }, currentStock: { lte: 0 } },
    });

    return {
      totalSales: sales._sum.grandTotal || 0,
      receivables: receivable._sum.balanceDue || 0,
      totalStock: product._sum.currentStock || 0,
      lowStock,
    };
  }
}