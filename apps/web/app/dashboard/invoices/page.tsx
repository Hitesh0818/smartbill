"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: InvoiceStatus;
  grandTotal: string | number;
  amountPaid: string | number;
  balanceDue: string | number;
  customer: {
    id: string;
    name: string;
  };
};

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status: InvoiceStatus) {
  const styles: Record<InvoiceStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    ISSUED: "bg-blue-100 text-blue-700",
    PARTIALLY_PAID: "bg-amber-100 text-amber-700",
    PAID: "bg-emerald-100 text-emerald-700",
    OVERDUE: "bg-rose-100 text-rose-700",
    CANCELLED: "bg-slate-200 text-slate-600",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

function humanizeStatus(status: InvoiceStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function InvoicesPage() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const getHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("smartbill_token")}`,
      "x-firm-id": localStorage.getItem("smartbill_firm") || "",
    }),
    [],
  );

  const loadInvoices = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      try {
        const response = await fetch(`${api}/invoices`, {
          headers: getHeaders(),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.message || "Unable to load invoices.");
        }

        setRows(Array.isArray(payload) ? payload : []);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load invoices.",
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [getHeaders],
  );

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-blue-600">SALES</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Invoices
          </h1>
          <p className="mt-2 text-slate-500">
            Create GST-ready invoices and track payment collections.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void loadInvoices(true)}
            disabled={isLoading || isRefreshing}
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>

          <Link
            href="/dashboard/invoices/new"
            className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + New invoice
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => void loadInvoices(true)}
              className="w-fit rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        </div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">
              Sales invoices
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {rows.length} {rows.length === 1 ? "invoice" : "invoices"} in
              this firm.
            </p>
          </div>

          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            SmartBill Sales
          </span>
        </div>

        {isLoading ? (
          <div className="p-6">
            <p className="text-sm text-slate-500">Loading invoices...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              No invoices yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first GST invoice to track sales, customer dues, and
              inventory movement.
            </p>

            <Link
              href="/dashboard/invoices/new"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Invoice date</th>
                  <th className="px-5 py-3">Due date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-right">Paid</th>
                  <th className="px-5 py-3 text-right">Balance due</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-t border-slate-100 text-sm transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900">
                      {invoice.customer.name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(invoice.invoiceDate)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(invoice.dueDate)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
                          invoice.status,
                        )}`}
                      >
                        {humanizeStatus(invoice.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {formatMoney(invoice.grandTotal)}
                    </td>

                    <td className="px-5 py-4 text-right text-emerald-700">
                      {formatMoney(invoice.amountPaid)}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {formatMoney(invoice.balanceDue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}