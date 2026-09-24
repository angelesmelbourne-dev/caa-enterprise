// components/reports/TopItemsTable.tsx
import type { TopItem } from "@/lib/reports";

export default function TopItemsTable({ data }: { data: TopItem[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-[#8F9198]">No items sold in this period.</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[#27282C] text-left text-[#8F9198]">
          <th className="font-normal pb-2">Item</th>
          <th className="font-normal pb-2">Type</th>
          <th className="font-normal pb-2 text-right">Qty</th>
          <th className="font-normal pb-2 text-right">Revenue</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={`${item.itemName}-${item.itemType}`} className="border-b border-[#1D1E22]">
            <td className="py-2.5 text-[#F4F4F5]">{item.itemName}</td>
            <td className="py-2.5 text-[#8F9198] capitalize">{item.itemType ?? "unspecified"}</td>
            <td className="py-2.5 text-right tabular-nums text-[#F4F4F5]">{item.quantity}</td>
            <td className="py-2.5 text-right tabular-nums text-[#F4F4F5]">
              ₱{item.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}