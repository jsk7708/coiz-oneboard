"use client"

import { ResponsiveContainer, ComposedChart, XAxis, YAxis, Tooltip, Legend, Bar, Line, CartesianGrid } from 'recharts'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

type ChartData = {
  date: string
  current: number
  previous: number
}

type Props = {
  dateRange: DateRange | undefined;
  team: string;
}

export function DayOverview({ dateRange, team }: Props) {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

 useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
  const fetchData = async () => {
    if (!dateRange?.from || !dateRange?.to) return

    const start = format(dateRange.from, "yyyyMMdd")
    const end = format(dateRange.to, "yyyyMMdd")

    try {
      const url = `/api/sales?name=get_Teamdaily_sales&start_date=${start}&end_date=${end}&team=${team}`
      const res = await fetch(url)

      if (!res.ok) throw new Error(` API 요청 실패 (${res.status})`)

      const rawData = await res.json()
      console.log("API 응답 확인:", rawData)
      const mainData = Array.isArray(rawData[0]) ? rawData[0] : rawData

      const parsed = mainData.map((row: any, index: number) => {
        const current = Number(row.current)
        const previous = Number(row.previous)

        if (isNaN(previous)) {
          console.warn(` row[${index}] 전년도 데이터 NaN →`, row.previous)
        } else if (previous === 0) {
          console.info(` row[${index}] 전년도 = 0`)
        }

        return {
          date: row.date ?? `날짜${index + 1}`,
          current: isNaN(current) ? 0 : current,
          previous: isNaN(previous) ? 0 : previous,
        }
      })

      console.log(" 최종 chartData ", parsed.slice(0, 5))
      setChartData(parsed)
    } catch (error) {
      console.error(" 매출 데이터 로드 실패:", error)
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [dateRange,team])

  //  hydration mismatch 방지용
  if (!mounted) return null // 또는 <div style={{ height: 400 }} />
  
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
         <ComposedChart data={chartData}>
             {/* <CartesianGrid strokeDasharray="3 3" />*/}
            <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(date) => {
                // '2025-05-01' → '05/01' 형식
                const [year, month, day] = date.split('-')
                return `${month}/${day}`
            }}
            />
           
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
            formatter={(value: any) => `${Number(value).toLocaleString()}원`}
            labelFormatter={(label: string) => {
                const [year, month, day] = label.split('-')
                return `${month}/${day}`
            }}
            />
            <Legend verticalAlign="top" />
            <Bar dataKey="current" name="금년" barSize={40} fill="#4e79a7" />
            <Line dataKey="previous" name="전년" stroke="#f28e2b" strokeWidth={2} dot={{ r: 4 }} />
         </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

