"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type InvoiceItem = {
  id: string;
  name: string;
  hsnSac?: string | null;
  quantity: string | number;
  unitPrice: string | number;
  discountPct: string | number;
  discountAmt: string | number;
  taxableValue: string | number;
  gstRate: string | number;
  cgstAmount: string | number;
  sgstAmount: string | number;
  igstAmount: string | number;
  total: string | number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  type: string;
  status: string;
  notes?: string | null;
  terms?: string | null;
  subtotal: string | number;
  discountTotal: string | number;
  taxableTotal: string | number;
  cgstTotal: string | number;
  sgstTotal: string | number;
  igstTotal: string | number;
  taxTotal: string | number;
  grandTotal: string | number;
  amountPaid: string | number;
  balanceDue: string | number;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    gstin?: string | null;
    addressLine?: string | null;
    state?: string | null;
    stateCode?: string | null;
    pincode?: string | null;
  };
  items: InvoiceItem[];
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("smartbill_token")}`,
    "x-firm-id": localStorage.getItem("smartbill_firm") || "",
  };

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${api}/invoices`, { headers });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Unable to load invoices.");
        }

        const found = payload.find((inv: Invoice) => inv.id === invoiceId);

        if (!found) {
          throw new Error("Invoice not found.");
        }

        if (isMounted) {
          setInvoice(found);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load invoice.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error || "Invoice not found."}
        </div>
        <div className="mt-4">
          <Link
            href="/dashboard/invoices"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  const isInterState = Number(invoice.igstTotal) > 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            INVOICE {invoice.invoiceNumber}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {invoice.customer.name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {invoice.invoiceDate
              ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN")
              : "—"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/invoices"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to invoices
          </Link>

          <button
            onClick={() => window.print()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Print
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900">
            Invoice items
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">HSN/SAC</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Disc %</th>
                  <th className="px-4 py-3 text-right">Taxable</th>
                  <th className="px-4 py-3 text-right">GST</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {item.hsnSac || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      ₹{Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {item.discountPct}%
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      ₹{Number(item.taxableValue).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {item.gstRate}%
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      ₹{Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Customer details
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <div>
                <p className="font-medium text-slate-700">
                  {invoice.customer.name}
                </p>
                <p className="text-slate-600">
                  {invoice.customer.addressLine || "—"}
                </p>
                <p className="text-slate-600">
                  {[
                    invoice.customer.city,
                    invoice.customer.state,
                    invoice.customer.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-slate-600">
                  GSTIN: {invoice.customer.gstin || "—"}
                </p>
                <p className="text-slate-600">
                  Phone: {invoice.customer.phone || "—"}
                </p>
                <p className="text-slate-600">
                  Email: {invoice.customer.email || "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Invoice totals
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{Number(invoice.subtotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>₹{Number(invoice.discountTotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-medium text-slate-900">
                <span>Taxable amount</span>
                <span>₹{Number(invoice.taxableTotal).toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2">
                {isInterState ? (
                  <div className="flex justify-between text-slate-600">
                    <span>IGST</span>
                    <span>₹{Number(invoice.igstTotal).toFixed(2)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-slate-600">
                      <span>CGST</span>
                      <span>₹{Number(invoice.cgstTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST</span>
                      <span>₹{Number(invoice.sgstTotal).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-between font-medium text-slate-900">
                <span>Tax total</span>
                <span>₹{Number(invoice.taxTotal).toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Grand total</span>
                  <span>₹{Number(invoice.grandTotal).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Amount paid</span>
                  <span>₹{Number(invoice.amountPaid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Balance due</span>
                  <span>₹{Number(invoice.balanceDue).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    invoice.status === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : invoice.status === "PARTIALLY_PAID"
                        ? "bg-amber-100 text-amber-700"
                        : invoice.status === "OVERDUE"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {invoice.notes || invoice.terms ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:block">
          <h2 className="text-lg font-bold text-slate-900">
            Notes & terms
          </h2>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            {invoice.notes ? (
              <p>
                <span className="font-medium text-slate-700">Notes:</span>{" "}
                {invoice.notes}
              </p>
            ) : null}
            {invoice.terms ? (
              <p>
                <span className="font-medium text-slate-700">
                  Terms:
                </span>{" "}
                {invoice.terms}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}