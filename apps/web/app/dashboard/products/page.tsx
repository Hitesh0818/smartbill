"use client";

import { useCallback, useEffect, useState } from "react";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Product = {
  id: string;
  name: string;
  sku?: string | null;
  hsnSac?: string | null;
  unit: string;
  gstRate: string | number;
  salePrice: string | number;
  currentStock: string | number;
  reorderLevel?: string | number | null;
};

type ProductForm = {
  name: string;
  sku: string;
  hsnSac: string;
  unit: string;
  salePrice: string;
  gstRate: string;
  currentStock: string;
};

const initialForm: ProductForm = {
  name: "",
  sku: "",
  hsnSac: "",
  unit: "PCS",
  salePrice: "0",
  gstRate: "18",
  currentStock: "0",
};

export default function ProductsPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(initialForm);
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
      const response = await fetch(`${api}/products`, {
        headers: headers(),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to load products.");
      }

      setRows(payload);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateField<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();

    if (!name) {
      setError("Enter a product or service name.");
      return;
    }

    const salePrice = Number(form.salePrice);
    const gstRate = Number(form.gstRate);
    const currentStock = Number(form.currentStock);

    if (
      Number.isNaN(salePrice) ||
      Number.isNaN(gstRate) ||
      Number.isNaN(currentStock) ||
      salePrice < 0 ||
      gstRate < 0 ||
      currentStock < 0
    ) {
      setError("Rate, GST, and stock must be valid zero or positive numbers.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`${api}/products`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          name,
          sku: form.sku.trim() || undefined,
          hsnSac: form.hsnSac.trim() || undefined,
          unit: form.unit,
          salePrice,
          gstRate,
          currentStock,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to create product.");
      }

      setForm(initialForm);
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create product.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div>
        <p className="text-sm font-semibold text-blue-600">INVENTORY</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Products & services
        </h1>
        <p className="mt-2 text-slate-500">
          Maintain item prices, GST rates, HSN/SAC codes, and available stock.
        </p>
      </div>

      <form
        onSubmit={add}
        className="mt-6 rounded-2xl bg-white p-5 shadow-sm"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Product or service name
            </span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
              placeholder="e.g. Consulting service"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              disabled={isSaving}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Sale price
            </span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
              type="number"
              min="0"
              step="0.01"
              value={form.salePrice}
              onChange={(event) =>
                updateField("salePrice", event.target.value)
              }
              disabled={isSaving}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              GST rate
            </span>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
              value={form.gstRate}
              onChange={(event) => updateField("gstRate", event.target.value)}
              disabled={isSaving}
            >
              {[0, 3, 5, 12, 18, 28].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}% GST
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Opening stock
            </span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
              type="number"
              min="0"
              step="0.001"
              value={form.currentStock}
              onChange={(event) =>
                updateField("currentStock", event.target.value)
              }
              disabled={isSaving}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              SKU
            </span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
              placeholder="Optional"
              value={form.sku}
              onChange={(event) => updateField("sku", event.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              HSN / SAC
            </span>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
              placeholder="Optional"
              value={form.hsnSac}
              onChange={(event) => updateField("hsnSac", event.target.value)}
              disabled={isSaving}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Unit
            </span>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-600"
              value={form.unit}
              onChange={(event) => updateField("unit", event.target.value)}
              disabled={isSaving}
            >
              <option value="PCS">Pieces</option>
              <option value="KG">Kilograms</option>
              <option value="LTR">Litres</option>
              <option value="MTR">Metres</option>
              <option value="HOUR">Hours</option>
              <option value="DAY">Days</option>
              <option value="BOX">Boxes</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Adding..." : "Add product"}
            </button>
          </div>
        </div>
      </form>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Product catalog
          </h2>
        </div>

        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">
            Loading products...
          </p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No products or services yet. Add your first item above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">HSN/SAC</th>
                  <th className="px-5 py-3">Sale price</th>
                  <th className="px-5 py-3">GST</th>
                  <th className="px-5 py-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-slate-100 text-sm"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {product.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {product.sku || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {product.hsnSac || "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      ₹{Number(product.salePrice).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {product.gstRate}%
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {product.currentStock} {product.unit}
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