-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'ACCOUNTANT');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('TAX_INVOICE', 'BILL_OF_SUPPLY', 'CREDIT_NOTE', 'DEBIT_NOTE');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE', 'OTHER');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('OPENING_STOCK', 'PURCHASE', 'SALE', 'SALE_RETURN', 'PURCHASE_RETURN', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Firm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "stateCode" TEXT,
    "pincode" TEXT,
    "logoUrl" TEXT,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
    "financialYearStart" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Firm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmMember" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FirmMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "gstin" TEXT,
    "pan" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "state" TEXT,
    "stateCode" TEXT,
    "pincode" TEXT,
    "creditLimit" DECIMAL(14,2),
    "openingDue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PRODUCT',
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "hsnSac" TEXT,
    "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 18,
    "salePrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "purchasePrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "currentStock" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "reorderLevel" DECIMAL(14,3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "type" "InvoiceType" NOT NULL DEFAULT 'TAX_INVOICE',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "placeOfSupplyCode" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxableTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "cgstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igstTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "amountPaid" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hsnSac" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "discountPct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discountAmt" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxableValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gstRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "cgstAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sgstAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "igstAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryChallan" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "challanNumber" TEXT NOT NULL,
    "challanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryChallan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallanItem" (
    "id" TEXT NOT NULL,
    "challanId" TEXT NOT NULL,
    "productId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'PCS',
    "unitPrice" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "ChallanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallanInvoice" (
    "challanId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,

    CONSTRAINT "ChallanInvoice_pkey" PRIMARY KEY ("challanId","invoiceId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "invoiceId" TEXT,
    "amount" DECIMAL(14,2) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mode" "PaymentMode" NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mode" "PaymentMode" NOT NULL,
    "vendorName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "ifscCode" TEXT,
    "upiId" TEXT,
    "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Firm_gstin_key" ON "Firm"("gstin");

-- CreateIndex
CREATE UNIQUE INDEX "FirmMember_firmId_userId_key" ON "FirmMember"("firmId", "userId");

-- CreateIndex
CREATE INDEX "Customer_firmId_name_idx" ON "Customer"("firmId", "name");

-- CreateIndex
CREATE INDEX "Product_firmId_name_idx" ON "Product"("firmId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_firmId_sku_key" ON "Product"("firmId", "sku");

-- CreateIndex
CREATE INDEX "Invoice_firmId_invoiceDate_idx" ON "Invoice"("firmId", "invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_customerId_status_idx" ON "Invoice"("customerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_firmId_invoiceNumber_key" ON "Invoice"("firmId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryChallan_firmId_challanNumber_key" ON "DeliveryChallan"("firmId", "challanNumber");

-- CreateIndex
CREATE INDEX "ChallanItem_challanId_idx" ON "ChallanItem"("challanId");

-- CreateIndex
CREATE INDEX "Payment_firmId_paymentDate_idx" ON "Payment"("firmId", "paymentDate");

-- CreateIndex
CREATE INDEX "Expense_firmId_expenseDate_idx" ON "Expense"("firmId", "expenseDate");

-- CreateIndex
CREATE INDEX "StockMovement_firmId_createdAt_idx" ON "StockMovement"("firmId", "createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_firmId_createdAt_idx" ON "AuditLog"("firmId", "createdAt");

-- AddForeignKey
ALTER TABLE "FirmMember" ADD CONSTRAINT "FirmMember_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmMember" ADD CONSTRAINT "FirmMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryChallan" ADD CONSTRAINT "DeliveryChallan_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanItem" ADD CONSTRAINT "ChallanItem_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "DeliveryChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanItem" ADD CONSTRAINT "ChallanItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanInvoice" ADD CONSTRAINT "ChallanInvoice_challanId_fkey" FOREIGN KEY ("challanId") REFERENCES "DeliveryChallan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallanInvoice" ADD CONSTRAINT "ChallanInvoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
