"use client";

import { useCallback, useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
  state?: string | null;
};

export default function CustomersPage() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const headers = useCallback(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("smartbill_token")}`,
      "x-firm-id": localStorage.getItem("smartbill_firm") || "",
      "Content-Type": "application/json",
    }),
    [],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${api}/customers`, {
        headers: headers(),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to load customers.");
      }

      setRows(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load customers.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    void load();
  }, [load]);

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customerName = name.trim();

    if (!customerName) {
      setError("Enter a customer name.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${api}/customers`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          name: customerName,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to create customer.");
      }

      setName("");
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create customer.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div>
        <p className="text-sm font-semibold text-blue-600">SALES</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Customers
        </h1>
        <p className="mt-2 text-slate-500">
          Manage the people and businesses you bill through SmartBill.
        </p>
      </div>

      <form
        onSubmit={add}
        className="mt-6 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row"
      >
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
          placeholder="Customer or business name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          required
        />

        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Adding..." : "Add customer"}
        </button>
      </form>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            All customers
          </h2>
        </div>

        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">
            Loading customers...
          </p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No customers yet. Add your first customer above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">GSTIN</th>
                  <th className="px-5 py-3">State</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-slate-100 text-sm"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {customer.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.gstin || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {customer.state || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}