import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { FirmsService } from "../firms/firms.service";

type InvoiceItemInput = {
  productId?: string;
  name: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  gstRate: number;
};

type CreateInvoiceInput = {
  customerId: string;
  dueDate?: string;
  notes?: string;
  items: InvoiceItemInput[];
};

type CalculatedItem = InvoiceItemInput & {
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

type InvoiceTotals = {
  subtotal: number;
  discount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
};

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firms: FirmsService,
  ) {}

  async list(userId: string, firmId: string) {
    await this.firms.assertMember(userId, firmId);
    return this.prisma.invoice.findMany({
      where: { firmId },
      include: { customer: true },
      orderBy: { invoiceDate: "desc" },
    });
  }

  async create(userId: string, firmId: string, data: CreateInvoiceInput) {
    await this.firms.assertMember(userId, firmId);

    if (!data.items?.length) {
      throw new BadRequestException("An invoice must contain at least one item.");
    }

    const [firm, customer] = await Promise.all([
      this.prisma.firm.findUnique({ where: { id: firmId } }),
      this.prisma.customer.findFirst({ where: { id: data.customerId, firmId } }),
    ]);

    if (!firm || !customer) {
      throw new NotFoundException("Firm or customer not found.");
    }

    const isIntraState = !customer.stateCode || customer.stateCode === firm.stateCode;

    const items: CalculatedItem[] = data.items.map((item) => {
      const grossAmount = item.quantity * item.unitPrice;
      const discount = grossAmount * ((item.discountPercent ?? 0) / 100);
      const taxable = grossAmount - discount;
      const totalTax = taxable * (item.gstRate / 100);

      return {
        ...item,
        discount: roundMoney(discount),
        taxable: roundMoney(taxable),
        cgst: roundMoney(isIntraState ? totalTax / 2 : 0),
        sgst: roundMoney(isIntraState ? totalTax / 2 : 0),
        igst: roundMoney(isIntraState ? 0 : totalTax),
        total: roundMoney(taxable + totalTax),
      };
    });

    const totals = items.reduce<InvoiceTotals>(
      (summary, item) => ({
        subtotal: summary.subtotal + item.quantity * item.unitPrice,
        discount: summary.discount + item.discount,
        taxable: summary.taxable + item.taxable,
        cgst: summary.cgst + item.cgst,
        sgst: summary.sgst + item.sgst,
        igst: summary.igst + item.igst,
        total: summary.total + item.total,
      }),
      { subtotal: 0, discount: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
    );

    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const updatedFirm = await tx.firm.update({
          where: { id: firmId },
          data: { nextInvoiceNumber: { increment: 1 } },
        });

        const invoiceNumber = `${firm.invoicePrefix}-${String(updatedFirm.nextInvoiceNumber - 1).padStart(5, "0")}`;

        const invoice = await tx.invoice.create({
          data: {
            firmId,
            customerId: customer.id,
            createdById: userId,
            invoiceNumber,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            notes: data.notes,
            subtotal: roundMoney(totals.subtotal),
            discountTotal: roundMoney(totals.discount),
            taxableTotal: roundMoney(totals.taxable),
            cgstTotal: roundMoney(totals.cgst),
            sgstTotal: roundMoney(totals.sgst),
            igstTotal: roundMoney(totals.igst),
            taxTotal: roundMoney(totals.cgst + totals.sgst + totals.igst),
            grandTotal: roundMoney(totals.total),
            balanceDue: roundMoney(totals.total),
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                name: item.name,
                hsnSac: item.hsnSac,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discountPct: item.discountPercent ?? 0,
                discountAmt: item.discount,
                taxableValue: item.taxable,
                gstRate: item.gstRate,
                cgstAmount: item.cgst,
                sgstAmount: item.sgst,
                igstAmount: item.igst,
                total: item.total,
              })),
            },
          },
          include: { customer: true, items: true },
        });

        for (const item of items) {
          if (!item.productId) continue;
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              firmId,
              productId: item.productId,
              type: "SALE",
              quantity: -item.quantity,
              referenceId: invoice.id,
            },
          });
        }

        return invoice;
      },
    );
  }
}