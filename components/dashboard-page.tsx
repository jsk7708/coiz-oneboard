"use client"

import { useState, useEffect } from "react"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { Overview } from "@/components/overview-chart"
import { DayOverview } from "@/components/Dayoverview-chart"
import { NxClientOverview } from "@/components/NxClientoverview-chart"
import { RecentSales } from "@/components/recent-sales"
import SalesTable from "@/components/sales-table"
import { DetailOverview } from "@/components/SalesDetail"
import { TopProducts } from "@/components/top-products"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesByCategoryChart } from "@/components/sales-by-category"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DateRange } from "react-day-picker"
import { format } from "date-fns"
import OrganizationTab from "@/components/OrganizationTab" 
import ToolSalesPivotTab from "@/components/ToolSalesPivotTab"

// 타입
type ChartItem = {
  name: string
  total: number
}

export default function DashboardPage() {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [chartData, setChartData] = useState<ChartItem[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: firstDayOfMonth,
    to: today,
  })
  
  const [selectedTab, setSelectedTab] = useState("overview")

  //총 매출 상태 정의
  const [totalSales, setTotalSales] = useState(0);
  const [diffPercent, setDiffPercent] = useState(0);

  const [teamSales, setTeamSales] = useState<
  { team: string; sales_total: number; last_year_sales_total: number; growth_rate: number }[]
  >([]);
  
  type ChartItem = {
    name: string;        // '1월', '2월', ...
    this_year: number;
    last_year: number;
  };

  type MallSalesItem = {
    mall: string
    sales_total: number
    growth_rate: number
  }
 const [mallSalesData, setMallSalesData] = useState<MallSalesItem[]>([]);
 
 const qtyBasedMalls = [ "지그재그","카카오톡스토어","화해","스토어팜(셀본)","쿠팡","메이크샵(셀본)","오배송처리"];
 
 type TeamAvgClientType = {
    Team: string;
    avgClientSales: number;
    avgClientGrowth: number;
    };

 const [teamAvgClientData, setTeamAvgClientData] = useState<TeamAvgClientType[]>([]);

 type TeamCountClientType = {
    Team: string;
    current_count: number;
    growth_rate: number;
    };

 const [teamCountClientData, setTeamCountClientData] = useState<TeamCountClientType[]>([]);    
 

  //날짜 바뀔 때마다 총 매출 데이터 API 호출
  useEffect(() => {
    const fetchTotalSales = async () => {
      if (!dateRange?.from || !dateRange?.to) return

      const start = format(dateRange.from, "yyyyMMdd")
      const end = format(dateRange.to, "yyyyMMdd")
      
      //console.log("시작일자(start):", start)
      //console.log("종료일자(end):", end)

      try {
        const res = await fetch(`/api/sales?name=get_TotalSalesByPeriod&start_date=${start}&end_date=${end}`)
        console.log("✅ 응답 상태:", res.status)
        const json = await res.json()
        const row = Array.isArray(json) && Array.isArray(json[0]) ? json[0][0] : json[0];
        console.log("📦 응답 데이터:", row)

        setTotalSales(row?.current_total || 0);
        setDiffPercent(row?.diff_percent || 0);

      } catch (err) {
        console.error("총 매출 조회 실패", err)
      }
    }

    fetchTotalSales()
  }, [dateRange])
  
  //월별매출추이 막대그래프
  useEffect(() => {
    const fetchChartData = async () => {
        if (!dateRange?.from) return;

        const year = dateRange.from.getFullYear();

        try {
        const res = await fetch(`/api/sales?name=get_sales_by_year_monthly&year=${year}`);
        const json = await res.json();
        console.log("📊 받아온 chartData:", json[0]);

        const row = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json;

        const formattedData: ChartItem[] = row.map((item: any) => ({
            name: item.month,
            this_year: Number(item.this_year),
            last_year: Number(item.last_year)
        }));

        setChartData(formattedData);
        } catch (error) {
        console.error("📊 월별 매출 추이 로딩 실패:", error);
        }
    };

    fetchChartData();
  }, [dateRange]);

  
  //팀별 매출 
  useEffect(() => {
    const fetchTeamSales = async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        const start = format(dateRange.from, "yyyyMMdd");
        const end = format(dateRange.to, "yyyyMMdd");

        try {
        const res = await fetch(`/api/sales?name=get_Total_TeamSalesByPeriod&start_date=${start}&end_date=${end}`);
        const json = await res.json();
        const rows = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json;
        setTeamSales(rows);
        } catch (err) {
        console.error("팀별 매출 조회 실패", err);
        }
    };

    fetchTeamSales();
  }, [dateRange]);
  
  //온라인판매 매출 
  useEffect(() => {
    const fetchMallSales = async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        const start = format(dateRange.from, "yyyyMMdd");
        const end = format(dateRange.to, "yyyyMMdd");

        const res = await fetch(`/api/sales?name=get_MallSalesWithYoY&start_date=${start}&end_date=${end}`);
        const json = await res.json();
        const result = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json;

        setMallSalesData(result);
    };

    fetchMallSales();
  }, [dateRange]);
 

  //평균객단가
  useEffect(() => {
    const fetchAvgSales = async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        const start = format(dateRange.from, "yyyyMMdd");
        const end = format(dateRange.to, "yyyyMMdd");

        try {
        const res = await fetch(`/api/sales?name=get_AvgSalesPerClientWithYo&start_date=${start}&end_date=${end}`);
        const json = await res.json();
        console.log("📦 평균 객단가 결과:", json);

        const result = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json;

        // 팀배열 저장
        setTeamAvgClientData(result);

        } catch (err) {
        console.error("📉 평균 주문 금액 API 오류", err);
        }
    };

    fetchAvgSales();
  }, [dateRange]);

   //고객수
  useEffect(() => {
    const fetchAvgSales = async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        const start = format(dateRange.from, "yyyyMMdd");
        const end = format(dateRange.to, "yyyyMMdd");

        try {
        const res = await fetch(`/api/sales?name=get_SalesClientWithYoY&start_date=${start}&end_date=${end}`);
        const json = await res.json();
        console.log("📦 고객수 결과:", json);

        const result = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json;

        // 팀배열 저장
        setTeamCountClientData(result);

        } catch (err) {
        console.error("📉 고객수 API 오류", err);
        }
    };

    fetchAvgSales();
  }, [dateRange]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b px-4 py-4 space-y-2 md:space-y-0 md:flex md:items-center md:justify-between">
        <h1 className="text-lg font-semibold text-center md:text-left">
           Coiz sales BI & Business Management System
        </h1>
         {(selectedTab === "overview" || selectedTab === "reports") && (
          <div className="flex justify-center md:justify-end">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          )}
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="space-y-1">
            <h1 className="text-xl font-bold flex items-center space-x-2">
                <span>📊</span>
                <span>대시보드</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-snug">
                판매, 고객, 조직 현황을 한 눈에 확인하세요.
            </p>
        </div>
        <Tabs defaultValue="overview"  value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="reports">상세</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
            <TabsTrigger value="tool">공구판매</TabsTrigger>
            <TabsTrigger value="organization">조직도</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">총 매출</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                     ₩{!isNaN(Number(totalSales)) ? Number(totalSales).toLocaleString() : "0"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                   전월 대비 {Number(diffPercent) >= 0 ? "+" : ""}
                   {Number(diffPercent).toFixed(1)}%
                  </p>
                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    {teamSales.length > 0 ? (
                        teamSales.map((item) => (
                        <div key={item.team} className="flex justify-between">
                            <span>{item.team}</span>
                            <span>
                            ₩{Number(item.sales_total).toLocaleString()}
                            <span className={`ml-2 ${Number(item.growth_rate) >= 0 ? "text-green-600" : "text-red-500"}`}>
                            ({Number(item.growth_rate) >= 0 ? "+" : ""}
                            {Number(item.growth_rate).toFixed(1)}%)
                            </span>
                            </span>
                        </div>
                        ))
                    ) : (
                        <div className="text-xs text-gray-400">팀별 데이터 없음</div>
                    )}
                 </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">온라인 판매</CardTitle>
                </CardHeader>
                <CardContent>
                    {mallSalesData.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                        <span>{item.mall}</span>
                        <span>
                        {qtyBasedMalls.includes(item.mall)
                            ? `${Number(item.sales_total).toLocaleString()}개`
                            : `₩${Number(item.sales_total).toLocaleString()}`}
                        <span className={`ml-2 ${Number(item.growth_rate) >= 0 ? "text-green-600" : "text-red-500"}`}>
                            ({Number(item.growth_rate) >= 0 ? "+" : ""}
                            {Number(item.growth_rate).toFixed(2)}%)
                        </span>
                        </span>
                    </div>
                    ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">평균 주문 금액</CardTitle>
                </CardHeader>
                <CardContent>
                   {teamAvgClientData.length > 0 ? (
                    teamAvgClientData.map((item) => (
                        <div key={item.Team} className="flex justify-between text-sm">
                        <span>{item.Team}</span>
                        <span>
                            ₩{Number(item.avgClientSales).toLocaleString()}
                            <span
                            className={`ml-2 ${
                                item.avgClientGrowth >= 0 ? "text-green-600" : "text-red-500"
                            }`}
                            >
                             ({Number(item.avgClientGrowth) >= 0 ? "+" : ""}
                              {Number(item.avgClientGrowth).toFixed(1)}%)
                            </span>
                        </span>
                        </div>
                    ))
                    ) : (
                    <div className="text-xs text-muted-foreground">팀별 객단가 없음</div>
                    )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">고객 수</CardTitle>
                </CardHeader>
                <CardContent>
                  {teamCountClientData.length > 0 ? (
                    teamCountClientData.map((item) => (
                        <div key={item.Team} className="flex justify-between text-sm">
                        <span>{item.Team}</span>
                        <span>
                            {Number(item.current_count).toLocaleString()}명
                            <span
                            className={`ml-2 ${
                                item.growth_rate >= 0 ? "text-green-600" : "text-red-500"
                            }`}
                            >
                             ({Number(item.growth_rate) >= 0 ? "+" : ""}
                              {Number(item.growth_rate).toFixed(1)}%)
                            </span>
                        </span>
                        </div>
                    ))
                    ) : (
                    <div className="text-xs text-muted-foreground">팀별 객단가 없음</div>
                    )}
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>월별 매출 추이</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview chartData={chartData} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>이탈 고객</CardTitle>
                  <CardDescription>팀별 이탈고객 구매기준 TOP5 내역입니다.(팀/구매횟수/최근구매일/총구매금액)</CardDescription>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto pr-2">
                  <RecentSales dateRange={dateRange} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>일별 매출 추이</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <DayOverview dateRange={dateRange}  />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>신규/고정 매출 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <NxClientOverview dateRange={dateRange}/>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>카테고리별 매출</CardTitle>
                </CardHeader>
                <CardContent>
                  <SalesByCategoryChart dateRange={dateRange} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>인기 상품</CardTitle>
                  <CardDescription>판매량 기준 상위 10개 상품입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopProducts dateRange={dateRange}/>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>이카운트 API 분석 챗봇 판매 데이터 검증 분석</CardTitle>
                <CardDescription>모든 판매 데이터를 필터링하고 분석할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesTable />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card className="border-none">
              <CardContent className="px-0 pt-0">
                <DetailOverview />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="organization" className="space-y-4">
            <Card>
              <CardContent className="px-0 pt-0">
                <OrganizationTab />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="tool" className="space-y-4">
            <Card>
              <CardContent className="px-0 pt-0">
                <ToolSalesPivotTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
