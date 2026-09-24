// components/reports/JobOrderStatus.tsx
import type { JobOrderStatusCount } from "@/lib/reports";

const STATUS_COLOR: Record<string, string> = {
  pending: "#F5A524",
  "in progress": "#3B82F6",
  in_progress: "#3B82F6",
  completed: "#10B981",
  cancelled: "#52525B",
};

export default function JobOrderStatus({ data }: { data: JobOrderStatusCount[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-[#8F9198]">No job orders logged yet.</p>;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <ul className="space-y-4">
      {data.map((d) => {
        const color = STATUS_COLOR[d.status.toLowerCase()] ?? "#71717A";
        const pct = Math.round((d.count / total) * 100);
        return (
          <li key={d.status}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm text-[#F4F4F5] capitalize">
                {d.status.replace("_", " ")}
              </span>
              <span className="text-sm tabular-nums text-[#F4F4F5]">{d.count}</span>
            </div>
            <div className="h-1 bg-[#27282C] rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}