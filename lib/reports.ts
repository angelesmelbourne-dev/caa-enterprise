// lib/reports.ts
//
// Data layer for the Reports Dashboard, built on your existing
// `lib/supabaseClient.ts` (anon-key browser client).
//
// All queries are scoped by tenant_id, since your schema is multi-tenant.

import { supabase } from "@/lib/supabaseClient";

export type RevenueSummary = {
  totalRevenue: number;
  saleCount: number;
  avgTicket: number;
  dailySeries: { date: string; total: number }[];
};

export type PaymentBreakdown = { method: string; total: number; count: number };

export type TopItem = {
  itemName: string;
  itemType: string | null;
  quantity: number;
  revenue: number;
};

export type StockAlert = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  minStock: number;
  source: "products" | "inventory";
};

export type JobOrderStatusCount = { status: string; count: number };

const DAY_MS = 24 * 60 * 60 * 1000;

/** Revenue totals + a daily series for the trend chart. */
export async function getRevenueSummary(
  tenantId: string,
  days = 30
): Promise<RevenueSummary> {
  const since = new Date(Date.now() - days * DAY_MS).toISOString();

  const { data, error } = await supabase
    .from("sales")
    .select("total_amount, created_at")
    .eq("tenant_id", tenantId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const totalRevenue = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);
  const saleCount = rows.length;
  const avgTicket = saleCount ? totalRevenue / saleCount : 0;

  // Bucket into calendar days so the chart has one point per day, even
  // days with zero sales.
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * DAY_MS);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const key = String(r.created_at).slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + Number(r.total_amount));
    }
  }
  const dailySeries = Array.from(buckets, ([date, total]) => ({ date, total }));

  return { totalRevenue, saleCount, avgTicket, dailySeries };
}

/** Revenue grouped by payment method. */
export async function getPaymentBreakdown(
  tenantId: string,
  days = 30
): Promise<PaymentBreakdown[]> {
  const since = new Date(Date.now() - days * DAY_MS).toISOString();

  const { data, error } = await supabase
    .from("sales")
    .select("total_amount, payment_method")
    .eq("tenant_id", tenantId)
    .gte("created_at", since);

  if (error) throw error;

  const map = new Map<string, { total: number; count: number }>();
  for (const r of data ?? []) {
    const method = r.payment_method || "Unspecified";
    const entry = map.get(method) ?? { total: 0, count: 0 };
    entry.total += Number(r.total_amount);
    entry.count += 1;
    map.set(method, entry);
  }
  return Array.from(map, ([method, v]) => ({ method, ...v })).sort(
    (a, b) => b.total - a.total
  );
}

/**
 * Best-selling items from sale_items, joined through sales for the tenant
 * and date filter (sale_items itself has no tenant_id).
 */
export async function getTopItems(
  tenantId: string,
  days = 30,
  limit = 8
): Promise<TopItem[]> {
  const since = new Date(Date.now() - days * DAY_MS).toISOString();

  const { data, error } = await supabase
    .from("sale_items")
    .select("item_name, item_type, quantity, total_price, sales!inner(tenant_id, created_at)")
    .eq("sales.tenant_id", tenantId)
    .gte("sales.created_at", since);

  if (error) throw error;

  const map = new Map<string, TopItem>();
  for (const r of data ?? []) {
    const key = `${r.item_name}::${r.item_type ?? ""}`;
    const entry = map.get(key) ?? {
      itemName: r.item_name,
      itemType: r.item_type,
      quantity: 0,
      revenue: 0,
    };
    entry.quantity += Number(r.quantity ?? 0);
    entry.revenue += Number(r.total_price ?? 0);
    map.set(key, entry);
  }
  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/** Products/inventory at or below their reorder threshold. */
export async function getStockAlerts(tenantId: string): Promise<StockAlert[]> {

  const [{ data: products, error: pErr }, { data: inventory, error: iErr }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, sku, stock, min_stock")
        .eq("tenant_id", tenantId)
        .order("stock", { ascending: true }),
      supabase
        .from("inventory")
        .select("id, name, sku, stock")
        .eq("tenant_id", tenantId)
        .order("stock", { ascending: true }),
    ]);

  if (pErr) throw pErr;
  if (iErr) throw iErr;

  const fromProducts: StockAlert[] = (products ?? [])
    .filter((p) => Number(p.stock) <= Number(p.min_stock))
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: Number(p.stock),
      minStock: Number(p.min_stock),
      source: "products" as const,
    }));

  // `inventory` has no min_stock column in your schema — flag anything at 0
  // until a threshold column exists.
  const fromInventory: StockAlert[] = (inventory ?? [])
    .filter((i) => Number(i.stock) <= 0)
    .map((i) => ({
      id: i.id,
      name: i.name,
      sku: i.sku,
      stock: Number(i.stock),
      minStock: 0,
      source: "inventory" as const,
    }));

  return [...fromProducts, ...fromInventory];
}

/**
 * Job order counts by status. job_orders has no tenant_id column — it's
 * scoped through customers, so we join that way.
 */
export async function getJobOrderStatusCounts(
  tenantId: string
): Promise<JobOrderStatusCount[]> {

  const { data, error } = await supabase
    .from("job_orders")
    .select("status, customers!inner(tenant_id)")
    .eq("customers.tenant_id", tenantId);

  if (error) throw error;

  const map = new Map<string, number>();
  for (const r of data ?? []) {
    const status = r.status || "Unspecified";
    map.set(status, (map.get(status) ?? 0) + 1);
  }
  return Array.from(map, ([status, count]) => ({ status, count }));
}