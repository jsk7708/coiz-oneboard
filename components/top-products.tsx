"use client"

import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

type Props = {
  dateRange: DateRange | undefined;
}

type ProductItem = {
  prdname: string;
  sales_total: number;
  percentage: number;
  type: "제품-온라인" | "제품-오프라인" | "기기";
};


export function TopProducts({ dateRange }: Props) {

const [items, setItems] = useState<ProductItem[]>([]);

useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const start = format(dateRange.from, "yyyyMMdd");
    const end = format(dateRange.to, "yyyyMMdd");

    const fetchAndProcess = async (apiName: string, label: "제품-온라인" | "제품-오프라인"  | "기기") => {
      try {
        const res = await fetch(`/api/sales?name=${apiName}&start_date=${start}&end_date=${end}`);
        const json = await res.json();
        const result = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : Array.isArray(json) ? json : [];

        const max = result[0]?.sales_total || 1;

        return result.map((item: any) => ({
          prdname: item.prdname,
          sales_total: item.sales_total,
          percentage: Math.round((item.sales_total / max) * 100),
          type: label,
        }));
      } catch (err) {
        console.error(`${label} 인기 상품 API 오류`, err);
        return [];
      }
    };

    const loadData = async () => {
      const productsOnline  = await fetchAndProcess("get_TopProducts_Online", "제품-온라인");
      const productsOffline = await fetchAndProcess("get_TopProducts_offline", "제품-오프라인");
      const devices = await fetchAndProcess("get_TopDevices", "기기");
      setItems([...productsOnline, ...productsOffline, ...devices]);
    };

    loadData();
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {["제품-온라인", "제품-오프라인", "기기"].map((group) => (
        <div key={group} className="mb-4">
          <h4 className="font-semibold text-sm md:text-base mb-2">{group.replace("제품-", "제품 ")}</h4>
          {items
            .filter((item) => item.type === group)
            .map((item, idx) => (
              <div key={`${group}-${idx}`} className="space-y-1">
                <div className="text-sm md:text-base">
                  <div className="whitespace-normal break-words leading-snug">{item.prdname}</div>
                  <div className="text-right text-xs md:text-sm text-muted-foreground">
                    {(item.sales_total ?? 0).toLocaleString()}개
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2 mt-1"  />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
