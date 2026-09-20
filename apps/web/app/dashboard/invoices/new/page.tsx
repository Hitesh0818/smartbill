"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type Item = {
  productId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  discountPercent: number;
};

const empty = (): Item => ({ name: "", quantity: 1, unitPrice: 0, gstRate: 18, discountPercent: 0 });

export default function NewInvoicePage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<Item[]>([empty()]);
  const [error, setError] = useState("");
  const router = useRouter();

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem("smartbill_token")}`,
    "x-firm-id": localStorage.getItem("smartbill_firm") || "",
    "Content-Type": "application/json",
  });

  useEffect(() => {
    fetch(`${api}/customers`, { headers: headers() })
      .then((r) => r.json())
      .then(setCustomers);
    fetch(`${api}/products`, { headers: headers() })
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const total = useMemo(
    () =>
      items.reduce((s, i) => {
        const t = i.quantity * i.unitPrice * (1 - i.discountPercent / 100);
        return s + t * (1 + i.gstRate / 100);
      }, 0),
    [items],
  );

  function update(i: number, k: keyof Item, v: any) {
    setItems((a) => a.map((x, n) => (n === i ? { ...x, [k]: v } : x)));
  }

  function choose(i: number, id: string) {
    const p = products.find((x) => x.id === id);
    if (p)
      setItems((a) =>
        a.map((x, n) =>
          n === i ? { ...x, productId: id, name: p.name, unitPrice: Number(p.salePrice), gstRate: Number(p.gstRate) } : x,
        ),
      );
  }

  async function save() {
    setError("");
    const r = await fetch(`${api}/invoices`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ customerId, items }),
    });
    if (!r.ok) {
      const d = await r.json();
      setError(d.message || "Could not create invoice");
      return;
    }
    router.push("/dashboard/invoices");
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Create invoice</h1>
      {error && <p className="mt-4 rounded bg-red-50 p-3 text-red-700">{error}</p>}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <label className="block max-w-md font-medium">
          Customer
          <select
            className="mt-2 w-full rounded-lg border p-3"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="text-left text-sm text-slate-500">
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Disc %</th>
                <th>GST %</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x, i) => (
                <tr key={i} className="border-t">
                  <td className="py-3">
                    <select
                      className="w-56 rounded border p-2"
                      value={x.productId || ""}
                      onChange={(e) => choose(i, e.target.value)}
                    >
                      <option value="">Custom item</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="ml-2 rounded border p-2"
                      value={x.name}
                      placeholder="Item name"
                      onChange={(e) => update(i, "name", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="w-20 rounded border p-2"
                      type="number"
                      value={x.quantity}
                      onChange={(e) => update(i, "quantity", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="w-24 rounded border p-2"
                      type="number"
                      value={x.unitPrice}
                      onChange={(e) => update(i, "unitPrice", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="w-20 rounded border p-2"
                      type="number"
                      value={x.discountPercent}
                      onChange={(e) => update(i, "discountPercent", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <select
                      className="rounded border p-2"
                      value={x.gstRate}
                      onChange={(e) => update(i, "gstRate", Number(e.target.value))}
                    >
                      {[0, 3, 5, 12, 18, 28].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </td>
                  <td>₹{(x.quantity * x.unitPrice * (1 - x.discountPercent / 100) * (1 + x.gstRate / 100)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setItems([...items, empty()])} className="mt-5 rounded-lg border border-blue-600 px-4 py-2 text-blue-700">
          + Add item
        </button>
        <div className="mt-8 flex items-center justify-between border-t pt-5">
          <p className="text-xl font-bold">Grand total: ₹{total.toFixed(2)}</p>
          <button
            onClick={save}
            disabled={!customerId || items.some((i) => !i.name)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Create invoice
          </button>
        </div>
      </div>
    </>
  );
}