"use client"

import {
  ComposedChart,
  Bar,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts"
import { useEffect, useState } from "react"

type ChartItem = {
  month: string;
  clinical: number;
  english: number;
  chinese: number;
  shanghai: number;
  clinical_last_year: number;
  english_last_year: number;
  chinese_last_year: number;
  shanghai_last_year: number;
};

interface OverviewProps {
  chartData: ChartItem[];
}

export function Overview({ chartData }: OverviewProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(value);
  };
  
  // SSR 오류 방지를 위한 조건부 렌더링
  if (!mounted) return null // 또는 <div style={{ height: 350 }} />

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        {/*<CartesianGrid strokeDasharray="3 3" />*/}
        <XAxis dataKey="month" stroke="#888888" fontSize={12}  />
        <YAxis
          stroke="#888888"
          fontSize={12}
         
          tickFormatter={(v) =>
            v >= 100000000 ? `${v / 100000000}억` :
            v >= 10000 ? `${v / 10000}만` :
            v.toLocaleString()
          }
        />
        <Tooltip
            formatter={(value: number, name: string, props: any) => {
                // 금액 형식화
                const formatted = new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
                }).format(value);

                // name 자체가 "임상(금년)" 또는 "임상(전년)" 등으로 들어오므로 그대로 사용
                return [formatted, name]; // 두 번째 항목이 라벨로 표시됨
            }}
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
        />
        <Legend />

        {/* ✅ 올해 매출 - 막대 */}
        <Bar dataKey="clinical" name="임상(금년)" fill="#333333" />
        <Bar dataKey="english" name="영어(금년)" fill="#0088FE" />
        <Bar dataKey="chinese" name="중국(금년)" fill="#FF8042" />
        <Bar dataKey="shanghai" name="상해(금년)" fill="#A259FF" />

        {/* ✅ 전년도 매출 - 꺾은선 */}
        <Line dataKey="clinical_last_year" name="임상(전년)" stroke="#333333" strokeWidth={2} />
        <Line dataKey="english_last_year" name="영어(전년)" stroke="#0088FE" strokeWidth={2} />
        <Line dataKey="chinese_last_year" name="중국(전년)" stroke="#FF8042" strokeWidth={2} />
        <Line dataKey="shanghai_last_year" name="상해(전년)" stroke="#A259FF" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
