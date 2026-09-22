import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("SmartBill@123", 12);

  const user = await prisma.user.upsert({
    where: {
      email: "owner@smartbill.local",
    },
    update: {
      name: "SmartBill Owner",
      passwordHash,
      isActive: true,
    },
    create: {
      name: "SmartBill Owner",
      email: "owner@smartbill.local",
      passwordHash,
      isActive: true,
    },
  });

  let firm = await prisma.firm.findFirst({
    where: {
      name: "SmartBill Demo Traders",
    },
  });

  if (!firm) {
    firm = await prisma.firm.create({
      data: {
        name: "SmartBill Demo Traders",
        legalName: "SmartBill Demo Traders",
        gstin: "27ABCDE1234F1Z5",
        state: "Maharashtra",
        stateCode: "27",
        invoicePrefix: "INV",
      },
    });
  }

  await prisma.firmMember.upsert({
    where: {
      firmId_userId: {
        firmId: firm.id,
        userId: user.id,
      },
    },
    update: {
      role: "OWNER",
    },
    create: {
      firmId: firm.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      firmId: firm.id,
      name: "Acme Enterprises",
    },
  });

  if (!existingCustomer) {
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

  const existingProduct = await prisma.product.findFirst({
    where: {
      firmId: firm.id,
      sku: "CONSULT-001",
    },
  });

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        firmId: firm.id,
        name: "Business Consulting Service",
        sku: "CONSULT-001",
        type: "SERVICE",
        unit: "HOUR",
        hsnSac: "998311",
        gstRate: 18,
        salePrice: 2500,
        purchasePrice: 0,
        currentStock: 100,
        reorderLevel: 5,
      },
    });
  }

  console.log("SmartBill demo data seeded successfully.");
  console.log("Login email: owner@smartbill.local");
  console.log("Login password: SmartBill@123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });