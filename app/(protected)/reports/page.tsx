import { supabase } from "@/lib/supabaseClient";
import {
  getRevenueSummary,
  getPaymentBreakdown,
  getTopItems,
  getStockAlerts,
  getJobOrderStatusCounts,
} from "@/lib/reports";
import RevenueChart from "@/components/reports/RevenueChart";
import PaymentBreakdownList from "@/components/reports/PaymentBreakdown";
import TopItemsTable from "@/components/reports/TopItemsTable";
import StockAlerts from "@/components/reports/StockAlerts";
import JobOrderStatus from "@/components/reports/JobOrderStatus";
import { redirect } from "next/navigation";
import { canAccessReports } from "@/lib/authorization";

const PERIODS = [7, 30, 90] as const;

// TODO: replace with your real auth → tenant resolution once you add login.
// Fine as-is while the app is effectively single-tenant.
async function getCurrentTenantId(): Promise<string> {
  const { data, error } = await supabase.from("tenants").select("id").limit(1).single();
  if (error || !data) throw new Error("Could not resolve tenant");
  return data.id;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
    return;
  }

  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!currentUser || !canAccessReports(currentUser.role)) {
    redirect("/dashboard");
    return;
  }
  const params = await searchParams;
  const days = PERIODS.includes(Number(params.days) as (typeof PERIODS)[number])
    ? Number(params.days)
    : 30;

  const tenantId = await getCurrentTenantId();

  const [revenue, payments, topItems, stockAlerts, jobStatus] = await Promise.all([
    getRevenueSummary(tenantId, days),
    getPaymentBreakdown(tenantId, days),
    getTopItems(tenantId, days),
    getStockAlerts(tenantId),
    getJobOrderStatusCounts(tenantId),
  ]);

  const deltaLabel =
    revenue.deltaPct == null || Number.isNaN(revenue.deltaPct)
      ? null
      : `${revenue.deltaPct >= 0 ? "↑" : "↓"} ${Math.abs(
        Math.round(revenue.deltaPct)
      )}% vs previous ${days} days`;
  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#F4F4F5]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="flex items-end justify-between mb-10">
          <h1 className="font-display text-lg font-medium text-[#8F9198]">Reports</h1>
          <nav className="flex gap-1 text-sm">
            {PERIODS.map((p) => (
              <a
                key={p}
                href={`?days=${p}`}
                className={`px-3 py-1.5 rounded-sm border ${p === days
                  ? "border-[#F5A524] text-[#F5A524]"
                  : "border-[#27282C] text-[#8F9198] hover:border-[#3F3F46]"
                  }`}
              >
                {p}d
              </a>
            ))}
          </nav>
        </header>

        {/* Hero: revenue figure */}
        <section className="mb-10">
          <div className="font-display text-6xl font-semibold tabular-nums tracking-tight">
            ₱{revenue.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center gap-3 mt-3 text-sm">
            <span className="text-[#8F9198]">total revenue, last {days} days</span>
            {deltaLabel && (
              <span className={revenue.deltaPct! >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}>
                {deltaLabel}
              </span>
            )}
          </div>
        </section>

        {/* Secondary stats */}
        <section className="grid grid-cols-3 border-y border-[#27282C] mb-10">
          <div className="py-4 pr-6">
            <div className="text-xs text-[#8F9198] mb-1">Sales</div>
            <div className="text-xl tabular-nums">{revenue.saleCount}</div>
          </div>
          <div className="py-4 px-6 border-l border-[#27282C]">
            <div className="text-xs text-[#8F9198] mb-1">Average ticket</div>
            <div className="text-xl tabular-nums">
              ₱{revenue.avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="py-4 pl-6 border-l border-[#27282C]">
            <div className="text-xs text-[#8F9198] mb-1">Job orders open</div>
            <div className="text-xl tabular-nums">
              {jobStatus
                .filter((s) => s.status.toLowerCase() !== "completed" && s.status.toLowerCase() !== "cancelled")
                .reduce((sum, s) => sum + s.count, 0)}
            </div>
          </div>
        </section>

        {/* Revenue trend + payment methods */}
        <section className="grid grid-cols-3 gap-10 mb-10">
          <div className="col-span-2">
            <h2 className="font-display text-sm font-medium text-[#8F9198] mb-4">Revenue by day</h2>
            <RevenueChart data={revenue.dailySeries} />
          </div>
          <div>
            <h2 className="font-display text-sm font-medium text-[#8F9198] mb-4">By payment method</h2>
            <PaymentBreakdownList data={payments} />
          </div>
        </section>

        {/* Top items + side panels */}
        <section className="grid grid-cols-3 gap-10">
          <div className="col-span-2">
            <h2 className="font-display text-sm font-medium text-[#8F9198] mb-4">Best-selling items</h2>
            <TopItemsTable data={topItems} />
          </div>
          <div className="space-y-10">
            <div>
              <h2 className="font-display text-sm font-medium text-[#8F9198] mb-4">Job order status</h2>
              <JobOrderStatus data={jobStatus} />
            </div>
            <div>
              <h2 className="font-display text-sm font-medium text-[#8F9198] mb-4">Stock alerts</h2>
              <StockAlerts data={stockAlerts} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}