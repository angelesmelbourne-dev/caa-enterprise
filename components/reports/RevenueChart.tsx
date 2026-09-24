// components/reports/RevenueChart.tsx
"use client";

type Props = {
  data: { date: string; total: number }[];
};

const ACCENT = "#F5A524";
const TRACK = "#27282C";

export default function RevenueChart({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const peakIndex = data.reduce(
    (best, d, i) => (d.total > data[best].total ? i : best),
    0
  );

  const width = 100;
  const height = 34;
  const barGap = 0.4;
  const barWidth = width / data.length - barGap;

  const formatShort = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-36"
      >
        <line x1="0" y1={height - 0.5} x2={width} y2={height - 0.5} stroke={TRACK} strokeWidth="0.15" />
        {data.map((d, i) => {
          const barHeight = (d.total / max) * (height - 3);
          const x = i * (barWidth + barGap);
          const y = height - barHeight - 0.5;
          const isPeak = i === peakIndex && d.total > 0;
          return (
            <rect
              key={d.date}
              x={x}
              y={y}
              width={Math.max(barWidth, 0.2)}
              height={barHeight}
              fill={d.total > 0 ? ACCENT : TRACK}
              opacity={d.total > 0 ? (isPeak ? 1 : 0.55) : 0.6}
            >
              <title>
                {formatShort(d.date)}: ₱{d.total.toLocaleString()}
              </title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-[#8F9198] tabular-nums">
        <span>{formatShort(data[0]?.date)}</span>
        <span>{formatShort(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}