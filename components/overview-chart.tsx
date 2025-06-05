"use client"

import { ComposedChart, Bar, Line, ResponsiveContainer, XAxis, YAxis, Tooltip , Legend} from "recharts"
import { useEffect, useState } from "react"

type ChartItem = {
  name: string;        // '1월', '2월', ...
  this_year: number;
  last_year: number;
};

interface OverviewProps {
  chartData: ChartItem[]
}

export function Overview({ chartData }: OverviewProps) {
  
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // or <div style={{ height: 350 }} />
    
  const formatYAxis = (value: string | number, _index: number): string | number => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value
    return numericValue >= 1000000 ? `${numericValue / 1000000}M` : numericValue
  }

  const formatTooltip = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(value)
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12}  />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickFormatter={(v) =>
              v >= 100000000
                ? `${v / 100000000}억`
                : v >= 10000
                ? `${v / 10000}만`
                : v.toLocaleString()
            }
        />
        <Tooltip
            formatter={(value: number, name: string) => [
            new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
            }).format(value),
            name
            ]}
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
        />
        <Legend />
         <Bar dataKey="this_year" name="금년" fill="#4e79a7" />
         <Line dataKey="last_year" name="전년" stroke="#f28e2b" strokeWidth={2} dot={{ r: 4 }} />
     </ComposedChart>
    </ResponsiveContainer>
  )
}
