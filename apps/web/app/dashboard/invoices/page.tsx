"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export default function InvoicesPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("smartbill_token");
    const firmId = localStorage.getItem("smartbill_firm") || "";
    fetch(`${api}/invoices`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-firm-id": firmId,
      },
    })
      .then((r) => r.json())
      .then(setRows);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link
          href="/dashboard/invoices/new"
          className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white"
        >
          + New invoice
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="p-4">Invoice</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className="border-t">
                <td className="p-4 font-medium">{x.invoiceNumber}</td>
                <td>{x.customer.name}</td>
                <td>{new Date(x.invoiceDate).toLocaleDateString("en-IN")}</td>
                <td>₹{x.grandTotal}</td>
                <td>₹{x.balanceDue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}