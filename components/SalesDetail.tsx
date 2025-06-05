"use client"

import { DatePickerWithRange } from "@/components/date-range-picker"
import { TopProducts } from "@/components/Teamtop-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Overview } from "@/components/Team-overview-chart"
import type { DateRange } from "react-day-picker"
import { DayOverview } from "@/components/TDayoverview-chart"


// 타입
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

export  function DetailOverview() {
const today = new Date()
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const [chartData, setChartData] = useState<ChartItem[]>([])
const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: firstDayOfMonth,
    to: today,
})

const [selectedTeam, setSelectedTeam] = useState<string>("임상팀");

//월별매출추이 막대그래프
useEffect(() => {
    const fetchChartData = async () => {
        if (!dateRange?.from) return;

        const year = dateRange.from.getFullYear();

        try {
        const res = await fetch(`/api/sales?name=get_team_sales_with_team_last_year&year=${year}`);
        const json = await res.json();
        console.log("📊 받아온 chartData:", json[0]);
        //setChartData(json);
        setChartData(json[0]);
        } catch (error) {
        console.error("📊 월별 매출 추이 로딩 실패:", error);
        }
    };

    fetchChartData();
}, [dateRange]);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7 px-0 pt-0 xl:px-0">
        <Card className="col-span-1 md:col-span-2 lg:col-span-4">
        <CardHeader>
            <CardTitle>팀 월별 매출 추이</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
            <Overview chartData={chartData} />
        </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-3">
            <CardHeader>
                <CardTitle>팀 일별 매출 추이</CardTitle>
                 <div className="mt-2 flex items-center gap-2">
                    <label htmlFor="team-select" className="font-medium whitespace-nowrap">
                        팀 선택
                    </label>
                    <select
                        id="team-select"
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-[200px]"
                    >
                        <option value="임상">임상</option>
                        <option value="영어">영어</option>
                        <option value="중국">중국</option>
                        <option value="상해">상해</option>
                    </select>
                </div>
            </CardHeader>
            <CardContent className="pl-2">
                <DayOverview dateRange={dateRange} team={selectedTeam}  />
            </CardContent>
        </Card>
        <Card className="col-span-1 md:col-span-2 lg:col-span-7">
        <CardHeader>
            <CardTitle>인기 상품</CardTitle>
            <CardDescription>판매량 기준 상위 10개 상품입니다.</CardDescription>
        </CardHeader>
        <CardContent>
            <TopProducts dateRange={dateRange}/>
        </CardContent>
        </Card>
    </div>
  )
}
