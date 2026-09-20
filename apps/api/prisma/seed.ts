import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("SmartBill@123", 12);

  const user = await prisma.user.upsert({
    where: { email: "owner@smartbill.local" },
    update: {},
    create: {
      name: "SmartBill Owner",
      email: "owner@smartbill.local",
      passwordHash,
    },
  });

  let firm = await prisma.firm.findFirst({ where: { name: "SmartBill Demo Traders" } });
  if (!firm) {
    firm = await prisma.firm.create({
      data: {
        name: "SmartBill Demo Traders",
        gstin: "27ABCDE1234F1Z5",
        state: "Maharashtra",
        stateCode: "27",
      },
    });
  }

  await prisma.firmMember.upsert({
    where: { firmId_userId: { firmId: firm.id, userId: user.id } },
    update: {},
    create: { firmId: firm.id, userId: user.id, role: "OWNER" },
  });

  const customer = await prisma.customer.findFirst({ where: { firmId: firm.id, name: "Acme Enterprises" } });
  if (!customer) {
    await prisma.customer.create({
      data: {
        firmId: firm.id,
        name: "Acme Enterprises",
        phone: "9876543210",
        gstin: "27AAACA1234A1Z1",
        state: "Maharashtra",
        stateCode: "27",
      },
    });
  }

  const product = await prisma.product.findFirst({ where: { firmId: firm.id, name: "Business Consulting Service" } });
  if (!product) {
    await prisma.product.create({
      data: {
        firmId: firm.id,
        name: "Business Consulting Service",
        sku: "CONSULT-001",
        unit: "HOUR",
        hsnSac: "998311",
        gstRate: 18,
        salePrice: 2500,
        currentStock: 100,
      },
    });
  }
}

main().finally(() => prisma.$disconnect());