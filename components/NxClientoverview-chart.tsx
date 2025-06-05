"use client"

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line
} from "recharts";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

type ChartDataItem = {
  항목: string;
  thisYear: number;
  lastYear: number;
};

type Props = {
  dateRange: DateRange | undefined;
};

export function NxClientOverview({ dateRange }: Props) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
 
  useEffect(() => {
    setMounted(true) // 클라이언트 렌더링 이후만 표시
  }, [])

  useEffect(() => {
  const fetchData = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    const start = format(dateRange.from, "yyyyMMdd")
    const end = format(dateRange.to, "yyyyMMdd")

    try {
      const url = `/api/sales?name=get_nxClient_sales&start_date=${start}&end_date=${end}`
      const res = await fetch(url)

      if (!res.ok) throw new Error(` API 요청 실패 (${res.status})`)

        const raw = await res.json();
        let row: any = {};
        if (Array.isArray(raw)) {
        if (Array.isArray(raw[0])) {
            row = raw[0][0] || {};  // 핵심 수정: 2중 배열 처리
        } else {
            row = raw[0] || {};
        }
        } else {
        row = raw || {};
        }

        //console.log("✅ 최종 row:", row);
        //console.log("✅ row keys:", Object.keys(row)); 

      const parsed: ChartDataItem[] = [
        {
          항목: "신규고객수",
          thisYear: Number(row["신규고객수"]) || 0,
          lastYear: Number(row["전년_신규고객수"]) || 0,
        },
        {
          항목: "신규고객매출",
          thisYear: Number(row["신규고객매출"]) || 0,
          lastYear: Number(row["전년_신규고객매출"]) || 0,
        },
        {
          항목: "고정고객수",
          thisYear: Number(row["고정고객수"]) || 0,
          lastYear: Number(row["전년_고정고객수"]) || 0,
        },
        {
          항목: "고정고객매출",
          thisYear: Number(row["고정고객매출"]) || 0,
          lastYear: Number(row["전년_고정고객매출"]) || 0,
        },
      ];

      setChartData(parsed);
    } catch (error) {
      console.error("매출 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [dateRange]);

  // hydration mismatch 방지
  if (!mounted) return null // 또는 <div style={{ height: 400 }} />

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
         <ComposedChart data={chartData}>
              {/* X축: 항목명 */}
          <XAxis dataKey="항목" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) =>
              v >= 100000000
                ? `${v / 100000000}억`
                : v >= 10000
                ? `${v / 10000}만`
                : v.toLocaleString()
            }
          />
          <Tooltip
            formatter={(value: any, name: any, props: any) => {
                const 항목 = props.payload?.항목 || "";

                const isCount = 항목.includes("고객수");  // 예: "신규고객수", "고정고객수"
                const 단위 = isCount ? "명" : "원";

                return [`${Number(value).toLocaleString()}${단위}`, name];
            }}
          />

          <Legend verticalAlign="top" />
          {/* 올해 막대 */}
          <Bar dataKey="thisYear" name="금년" barSize={40} fill="#4e79a7" />
          {/* 전년도 꺾은선 */}
          <Line
            dataKey="lastYear"
            name="전년"
            stroke="#f28e2b"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
         </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

