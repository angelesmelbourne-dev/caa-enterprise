// components/reports/PaymentBreakdown.tsx
import type { PaymentBreakdown } from "@/lib/reports";

export default function PaymentBreakdownList({
  data,
}: {
  data: PaymentBreakdown[];
}) {
  const max = Math.max(1, ...data.map((d) => d.total));

  if (data.length === 0) {
    return <p className="text-sm text-[#8F9198]">No sales recorded in this period.</p>;
  }

  return (
    <ul className="space-y-4">
      {data.map((d) => (
        <li key={d.method}>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-sm text-[#F4F4F5] capitalize">{d.method}</span>
            <span className="text-sm tabular-nums text-[#F4F4F5]">
              ₱{d.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="h-1 bg-[#27282C] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F5A524]"
              style={{ width: `${(d.total / max) * 100}%` }}
            />
          </div>
          <div className="text-xs text-[#8F9198] mt-1 tabular-nums">
            {d.count} sale{d.count === 1 ? "" : "s"}
          </div>
        </li>
      ))}
    </ul>
  );
}