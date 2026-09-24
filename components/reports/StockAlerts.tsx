// components/reports/StockAlerts.tsx
import type { StockAlert } from "@/lib/reports";

export default function StockAlerts({ data }: { data: StockAlert[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-[#8F9198]">Everything is above its reorder threshold.</p>;
  }

  return (
    <ul className="divide-y divide-[#1D1E22]">
      {data.map((item) => (
        <li key={`${item.source}-${item.id}`} className="py-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-[#F4F4F5]">{item.name}</div>
            <div className="text-xs text-[#8F9198] mt-0.5">
              {item.sku ? item.sku : "no sku"}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm tabular-nums text-[#EF4444]">{item.stock} left</div>
            {item.minStock > 0 && (
              <div className="text-xs text-[#8F9198] tabular-nums">reorder at {item.minStock}</div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}