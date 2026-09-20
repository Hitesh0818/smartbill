export type GstRate = 0 | 3 | 5 | 12 | 18 | 28;
export type TaxType = "INTRA_STATE" | "INTER_STATE";

export type InvoiceLineInput = {
  productId?: string;
  name: string;
  hsnSac?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  gstRate: GstRate;
};

export type CalculatedInvoiceLine = InvoiceLineInput & {
  discountAmount: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  lineTotal: number;
};

export type InvoiceTotals = {
  subtotal: number;
  discountTotal: number;
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  taxTotal: number;
  grandTotal: number;
};

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export function determineTaxType(sellerStateCode: string, buyerStateCode?: string | null): TaxType {
  return !buyerStateCode || sellerStateCode === buyerStateCode ? "INTRA_STATE" : "INTER_STATE";
}

export function calculateInvoiceLine(line: InvoiceLineInput, taxType: TaxType): CalculatedInvoiceLine {
  const gross = line.quantity * line.unitPrice;
  const discountAmount = gross * ((line.discountPercent ?? 0) / 100);
  const taxableValue = gross - discountAmount;
  const totalTax = taxableValue * (line.gstRate / 100);
  const cgstAmount = taxType === "INTRA_STATE" ? totalTax / 2 : 0;
  const sgstAmount = taxType === "INTRA_STATE" ? totalTax / 2 : 0;
  const igstAmount = taxType === "INTER_STATE" ? totalTax : 0;
  return {
    ...line,
    discountAmount: money(discountAmount), taxableValue: money(taxableValue),
    cgstAmount: money(cgstAmount), sgstAmount: money(sgstAmount),
    igstAmount: money(igstAmount), totalTax: money(totalTax),
    lineTotal: money(taxableValue + totalTax),
  };
}

export function calculateInvoiceTotals(lines: InvoiceLineInput[], taxType: TaxType): InvoiceTotals {
  return lines.map((line) => calculateInvoiceLine(line, taxType)).reduce<InvoiceTotals>((a, line) => ({
    subtotal: money(a.subtotal + line.quantity * line.unitPrice),
    discountTotal: money(a.discountTotal + line.discountAmount),
    taxableTotal: money(a.taxableTotal + line.taxableValue),
    cgstTotal: money(a.cgstTotal + line.cgstAmount),
    sgstTotal: money(a.sgstTotal + line.sgstAmount),
    igstTotal: money(a.igstTotal + line.igstAmount),
    taxTotal: money(a.taxTotal + line.totalTax),
    grandTotal: money(a.grandTotal + line.lineTotal),
  }), { subtotal: 0, discountTotal: 0, taxableTotal: 0, cgstTotal: 0, sgstTotal: 0, igstTotal: 0, taxTotal: 0, grandTotal: 0 });
}
