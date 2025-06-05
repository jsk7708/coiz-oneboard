"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useMediaQuery } from "react-responsive"

type Props = {
  dateRange: DateRange | undefined;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#ff6666", "#33cc33", "#9966ff", "#00cccc", "#ffcc00"]


export function SalesByCategoryChart({ dateRange }: Props) {
  
 const [data, setData] = useState<{ name: string; value: number }[]>([])
 const isMobile = useMediaQuery({ query: "(max-width: 768px)" }) // 미디어 쿼리
 const chartHeight = isMobile ? 300 : 180 // 반응형 높이 설정
 const isDesktop = useMediaQuery({ minWidth: 1024 })

  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.from || !dateRange?.to) return
      const start = format(dateRange.from, "yyyyMMdd")
      const end = format(dateRange.to, "yyyyMMdd")

      const res = await fetch(`/api/sales?name=get_SalesByPrdGroupWithAbs&start_date=${start}&end_date=${end}`)
      const json = await res.json()
      const result = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json

      // ✅ 2% 미만 항목은 기타로 합산
      const total = result.reduce((sum: number, item: any) => sum + Number(item.sales_total), 0)
      const important = result
        .map((item: any) => ({
          name: item.prdgroup_name,
          value: Number(item.sales_total),
        }))
        .filter((item) => item.value > total * 0.02)

      const others = result
        .map((item: any) => ({
          name: item.prdgroup_name,
          value: Number(item.sales_total),
        }))
        .filter((item) => item.value <= total * 0.02)

      const othersSum = others.reduce((sum, item) => sum + item.value, 0)
      if (othersSum > 0) {
        important.push({ name: "기타", value: othersSum })
      }

      setData(important)
    }

    fetchData()
  }, [dateRange])

  return (
    <ResponsiveContainer width="100%" height={isDesktop ? 410 : 320}>
      <PieChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
        <Pie
            data={data}
            cx="50%"
            cy="40%"
            labelLine={false}
            outerRadius={isDesktop ? 150 : 100}
            fill="#8884d8"
            dataKey="value"
            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                const RADIAN = Math.PI / 180;
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                return (
                <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="16"
                    fontWeight="bold" 
                >
                    {`${(percent * 100).toFixed(0)}%`}
                </text>
                );
            }}
            >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
        </Pie>
    <Legend 
      verticalAlign="bottom" 
      layout="horizontal" 
      wrapperStyle={{ fontSize: 13, marginTop: 20 , fontWeight: "bold" }} 
    />
      </PieChart>
    </ResponsiveContainer>
  )
}

