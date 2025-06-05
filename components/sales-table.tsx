"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Search, RefreshCw } from "lucide-react"
import { Label } from "@/components/ui/label"


// 숫자 또는 숫자처럼 보이는 값인지 판단
const isCommaTarget = (header: string) => {
  return (
    header.includes("총판매금액") ||
    header.includes("총판매수량") ||
    header.includes("판매금액") ||
    header.includes("1월") ||
    header.includes("2월") ||
    header.includes("3월") ||
    header.includes("4월") ||
    header.includes("5월") ||
    header.includes("6월") ||
    header.includes("7월") ||
    header.includes("8월") ||
    header.includes("9월") ||
    header.includes("10월") ||
    header.includes("11월") ||
    header.includes("12월") ||
    header.includes("국내영업팀") ||
    header.includes("중국영업팀") ||
    header.includes("영어영업팀") ||
    header.includes("신규고객_매출") ||
    header.includes("고정고객_매출") ||
    header.includes("신규고객수") ||
    header.includes("고정고객수") ||
    header.includes("구매금액") ||
    header.includes("재구매금액") ||
    header.includes("이탈금액") ||
    header.includes("평균단가") ||
    header.includes("판매횟수")
  );
};


export default function Home() {
  const [selectedFunction, setSelectedFunction] = useState("")
  const [yearMonth, setYearMonth] = useState("")
  const [year, setYear] = useState("")
  const [clientName, setClientName] = useState("")
  const [productName, setProductName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [empName, setEmpName] = useState("")
  const [limit, setLimit] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [showRfmSummary, setShowRfmSummary] = useState(false)
  const [showImportantCustomers, setShowImportantCustomers] = useState(false)
  const [selectedClient, setSelectedClient] = useState<{ code: string; name: string } | null>(null);
  const [productRfmData, setProductRfmData] = useState<any[]>([]);

  const apiOptions = [
    { value: "placeholder", label: "***** API 선택하세요 *****" },
    { value: "ecount_guide", label: "0. 이카운트 API 분석 챗봇 가이드" },
    { value: "get_new_customers", label: "1. 해당년도&월 신규 거래처 API" },
    { value: "get_year_product_sales", label: "2. 해당년도별 제품별 판매현황 API" },
    { value: "get_yearly_sales", label: "3. 연도별 총 판매금액 API" },
    { value: "get_product_sales", label: "4. 특정제품에 대한 판매현황 API" },
    { value: "get_year_customers", label: "5. 거래처&해당년도 월별 판매금액현형 API" },
    { value: "get_year_product_best_sales", label: "6. 해당년도 제품 월별 판매 best 100 수량으로 판매현황 API" },
    { value: "call_proc_new_customer_year", label: "7. 해당년도 월별 신규 거래처수 현황 API" },
    { value: "get_manager_customer", label: "8. 해당년도 월별 담당자별 거래처수 현황 API" },
    { value: "get_manager_sales", label: "9. 해당년도 월별 담당자별 거래처 구매금액현황 API" },
    { value: "get_manager_sales_by_date", label: "10. 특정기간동안의 담당자별 총 판매 금액 API" },
    { value: "get_year_customers_product", label: "11. 해당년도&거래처 제품별 월별 판매금액현형 API" },
    { value: "get_year_customers_prdQty", label: "12. 해당년도&거래처 제품별 월별 판매수량현형 API" },
    { value: "get_year_monthly_sales", label: "13. 연도별&월별 총판매금액 API" },
    { value: "get_monthly_product_best", label: "14. 해당년월에 제품 판매금액현황 API" },
    { value: "get_TeamSales_Summary", label: "15. 연도별 영업팀별 총 판매금액현황 API" },
    { value: "get_new_customers_prd", label: "16. 해당년도&월 신규 거래처 제품 판매현황 API" },
    { value: "getMonthlyRegularNewCustomer", label: "17. 해당년도 신규/고정 거래처 판매금액현황 API" },
    { value: "get_year_MC_sales", label: "18. 해당년도 기기별 판매금액현황 API" },
    { value: "get_year_SubMaterial_sales", label: "19. 해당년도 부자재소모품외 판매금액현황 API" },
    { value: "get_year_prdGroup_sales", label: "20. 해당년도 품목그룹별 판매금액현황 API" },
    { value: "get_churn_customer_report", label: "21. 이탈구매고객 현황 API" },
    { value: "get_manager_churn_report", label: "22. 담당자 이탈구매고객 현황 API" },
    { value: "get_product_sales_trend_by_date", label: "23. 제품 일자별 판매 현황 API" },
    { value: "get_customer_purchase_summary", label: "24. 특정기간동안의 특정거래처 판매현황 API" },
    { value: "get_lost_customers_by_manager", label: "25. 담당자 거래처 이탈요약 RFM현황 API" },
    { value: "get_clientPrdSales_summary", label: "26. 특정제품 특정거래처 구매횟수현황 API" },
    { value: "get_AnalyzeTopClientByProduct", label: "27. 특정제품 베스트 거래처현황 API" },
  ]

  // 입력 필드 매핑
  const inputMappings: Record<string, string[]> = {
    ecount_guide: [],
    get_new_customers: ["year_month"],
    get_year_product_sales: ["year"],
    get_yearly_sales: [],
    get_product_sales: ["product"],
    get_year_customers: ["year", "client"],
    get_year_product_best_sales: ["year"],
    call_proc_new_customer_year: ["year"],
    get_manager_customer: ["year"],
    get_manager_sales: ["year"],
    get_manager_sales_by_date: ["period"],
    get_year_customers_product: ["year", "client"],
    get_year_customers_prdQty: ["year", "client"],
    get_year_monthly_sales: [],
    get_monthly_product_best: ["year_month"],
    get_TeamSales_Summary: [],
    get_new_customers_prd: ["year_month"],
    getMonthlyRegularNewCustomer: ["year"],
    get_year_MC_sales: ["year"],
    get_year_SubMaterial_sales: ["year"],
    get_year_prdGroup_sales: ["year"],
    get_churn_customer_report: ["period"],
    get_manager_churn_report: ["period", "emp_name"],
    get_product_sales_trend_by_date: ["period", "product"],
    get_customer_purchase_summary: ["period", "client"],
    get_lost_customers_by_manager: ["emp_name", "p_limit"],
    get_clientPrdSales_summary: ["product", "client"],
    get_AnalyzeTopClientByProduct: ["product"],
  }

  // 테이블 헤더 매핑
  const headerMappings: Record<string, string[]> = {
    ecount_guide: [
      "번호",
      "역활",
      "함수이름",
      "함수설명",
      "질문예시",
      "필수입력값_예시",
      "재호출방법",
      "호출결과형태",
      "데이터검증_웹사이트",
      "호출실패시해결방법",
    ],
    get_new_customers: ["번호", "거래처코드", "거래처명", "판매금액"],
    get_year_product_sales: ["번호", "년도", "품목그룹", "품목명", "총판매수량", "총판매금액"],
    get_yearly_sales: ["번호", "년도", "총판매금액"],
    get_product_sales: ["번호", "년도", "품목명", "총판매수량", "총판매금액"],
    get_year_customers: ["번호","거래처명","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월","총판매금액",],
    get_year_product_best_sales: ["번호","제품명","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월","총판매수량",],
    call_proc_new_customer_year: ["번호","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월",],
    get_manager_customer: ["번호","담당자","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월",],
    get_manager_sales: ["번호","담당자","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월",],
    get_manager_sales_by_date: ["번호", "담당자", "총판매금액"],
    get_year_customers_product: ["번호","품목명","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월","총판매금액",],
    get_year_customers_prdQty: ["번호","품목명","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월","총판매수량",],
    get_year_monthly_sales: ["번호","년도","1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월",],
    get_monthly_product_best: ["번호", "품목명", "총판매금액"],
    get_TeamSales_Summary: ["번호", "년도", "국내영업팀", "중국영업팀", "영어영업팀"],
    get_new_customers_prd: ["번호", "제품명", "총판매수량", "총판매금액"],
    getMonthlyRegularNewCustomer: ["번호", "구매년월", "신규고객_매출", "고정고객_매출", "신규고객수", "고정고객수"],
    get_year_MC_sales: ["번호", "년도", "품목그룹", "품목명", "총판매수량", "총판매금액"],
    get_year_SubMaterial_sales: ["번호", "년도", "품목그룹", "품목명", "총판매수량", "총판매금액"],
    get_year_prdGroup_sales: ["번호", "년도", "품목그룹", "총판매수량", "총판매금액"],
    get_churn_customer_report: ["번호","거래처코드","거래처명","구매금액","재구매금액","이탈금액","마지막구매일","이탈금액비중(%)","거래처담당자","거래처사용유무",
    ],
    get_manager_churn_report: ["번호","거래처코드","거래처명","구매금액","재구매금액","이탈금액","마지막구매일","이탈금액비중(%)","거래처담당자","거래처사용유무",],
    get_product_sales_trend_by_date: ["번호", "일자", "품목그룹", "품목명", "총판매수량", "총판매금액"],
    get_customer_purchase_summary: ["번호","거래처코드","거래처명","총판매금액","총판매수량","평균단가","첫구매일","최근구매일",],
    get_lost_customers_by_manager: ["번호","거래처코드","거래처명","총판매금액","총구매횟수","rfm_score","최근구매일",],
    get_clientPrdSales_summary: ["번호","거래처코드","거래처명","년도","품목명","총판매수량","총판매금액","총구매횟수","최근구매일",],
    get_AnalyzeTopClientByProduct: ["번호","거래처코드","거래처명","품목명","총판매수량","총판매금액","총구매횟수","최근구매일","구매년월이력",],
  }

  const handleFunctionChange = (value: string) => {
    setSelectedFunction(value)
    setData([])
    setShowRfmSummary(false)
    setShowImportantCustomers(false)
    setSelectedClient(null)
    setProductRfmData([])
  }

  const fetchData = async () => {
    if (!selectedFunction || selectedFunction === "placeholder") {
      alert("API를 선택하세요.")
      return
    }

    setLoading(true);
    try {
            const params: Record<string, string> = { name: selectedFunction }

            if (selectedFunction.includes("product")) {
            params["product_id"] = productName
            }
            if (yearMonth) params["year_month"] = yearMonth
            if (year) params["year"] = year
            if (clientName) params["clientName"] = clientName
            if (startDate) params["start_date"] = startDate
            if (endDate) params["end_date"] = endDate
            if (empName) params["emp_name"] = empName
            if (limit) params["p_limit"] = limit

            const query = new URLSearchParams(params).toString()
            //const response = await fetch(`https://4efe-218-159-222-76.ngrok-free.app/sales?${query}`)
            const response = await fetch(`/api/sales?${query}`)

            const result = await response.json();
            const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
            setData(rows);

           // console.log("🧪 setData 전 데이터:", result);
           // console.log("✅ 적용된 rows:", rows);
            //console.log("✅ 컬럼 키 목록:", Object.keys(rows[0]));

            //const result = await response.json()
            if (!response.ok) {
            throw new Error(result?.error || "오류 발생")
            }

            //const mockData = result // 실제 데이터 사용 시
            //setData(mockData)

            if (selectedFunction === "get_lost_customers_by_manager") {
            setShowRfmSummary(true)
            setShowImportantCustomers(true)
            }
        } catch (error: any) {
            alert(`API 오류: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

  const downloadCSV = () => {
    if (!data || data.length === 0) {
      alert("다운로드할 데이터가 없습니다.")
      return
    }

    const headers = headerMappings[selectedFunction] || Object.keys(data[0])
    let csvContent = headers.join(",") + "\n"

    data.forEach((row, index) => {
        const values = headers.map((header) => {
        let value = row[header]

        // 번호 자동 채번 처리 (보정)
        if (header === "번호") value = index + 1

        return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : value ?? ""
        })
        csvContent += values.join(",") + "\n"
    })

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const fileName = `${selectedFunction}_data.csv`

    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
  }

 
  //클릭 핸들러 함수도 이 내부에 작성
  const handleClientRowClick = async (clientCode: string, clientName: string) => {
    setSelectedClient({ code: clientCode, name: clientName });

    try {
      const res = await fetch(`/api/sales?name=get_product_rfm_by_client&client_code=${clientCode}`);

      const json = await res.json();
      //setProductRfmData(json);

      const rows = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json;
      setProductRfmData(rows); // 실제 데이터만 저장

    } catch (error) {
      console.error("제품별 RFM 데이터 로딩 실패:", error);
      setProductRfmData([]);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/*<h1 className="text-2xl font-bold mb-6">COIZ 이카운트 API 분석 챗봇 판매 데이터 검증 웹사이트</h1>*/}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="col-span-full">
              <Label htmlFor="function">API 선택:</Label>
              <Select value={selectedFunction} onValueChange={handleFunctionChange}>
                <SelectTrigger id="function" className="w-full sm:max-w-[300px] truncate">
                  <SelectValue placeholder="API 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {apiOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                       <div className="truncate w-[280px]" title={option.label}>
                        {option.label}
                       </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {inputMappings[selectedFunction]?.includes("year_month") && (
              <div>
                <Label htmlFor="year_month">연도 및 월:</Label>
                <Input
                  id="year_month"
                  type="month"
                  placeholder="예: 2024-06"
                  value={yearMonth}
                  onChange={(e) => setYearMonth(e.target.value)}
                />
              </div>
            )}

            {inputMappings[selectedFunction]?.includes("year") && (
              <div>
                <Label htmlFor="year">연도:</Label>
                <Input
                  id="year"
                  type="text"
                  placeholder="예: 2024 숫자만 입력"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            )}

            {inputMappings[selectedFunction]?.includes("client") && (
              <div>
                <Label htmlFor="clientName">거래처명:</Label>
                <Input
                  id="clientName"
                  type="text"
                  placeholder="거래처명 정확히 입력"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
            )}

            {inputMappings[selectedFunction]?.includes("product") && (
              <div>
                <Label htmlFor="prdName">제품명:</Label>
                <Input
                  id="prdName"
                  type="text"
                  placeholder="제품명을 정확히 입력"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>
            )}

            {inputMappings[selectedFunction]?.includes("period") && (
              <>
                <div>
                  <Label htmlFor="start_date">시작일자:</Label>
                  <Input
                    id="start_date"
                    type="text"
                    placeholder="예: 20240101 숫자만 입력"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">종료일자:</Label>
                  <Input
                    id="end_date"
                    type="text"
                    placeholder="예: 20240115 숫자만 입력"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {inputMappings[selectedFunction]?.includes("emp_name") && (
              <div>
                <Label htmlFor="empName">담당자명:</Label>
                <Input
                  id="empName"
                  type="text"
                  placeholder="담당자명을 입력"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                />
              </div>
            )}

            {inputMappings[selectedFunction]?.includes("p_limit") && (
              <div>
                <Label htmlFor="p_limit">조회건수 top:</Label>
                <Input
                  id="p_limit"
                  type="text"
                  placeholder="조회건수를 입력 예: 100 숫자만 입력"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={fetchData} disabled={loading}>
              {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              조회
            </Button>
            <Button variant="outline" onClick={downloadCSV} disabled={!data.length}>
              <Download className="mr-2 h-4 w-4" />
              CSV 다운로드
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="text-center py-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-lg font-medium text-red-600">🔄 데이터 로딩 중입니다. 잠시만 기다려 주세요...</p>
        </div>
      )}

      {data.length > 0 && selectedFunction !== "get_lost_customers_by_manager" &&  (
        <Card>
          <CardHeader>
            <CardTitle>조회 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>번호</TableHead>
                        {(headerMappings[selectedFunction] || Object.keys(data[0])).map((header) =>
                        header !== "번호" && <TableHead key={header}>{header}</TableHead>
                        )}
                    </TableRow>
                    </TableHeader>
                <TableBody>
                    {data.map((row, index) => (
                        <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell> {/* 번호 자동 증가 */}
                        {(headerMappings[selectedFunction] || Object.keys(data[0])).map((header) =>
                            header !== "번호" && (
                            <TableCell key={header}>
                                 {isCommaTarget(header) && !isNaN(Number(row[header]))
                                    ? Number(row[header]).toLocaleString()
                                    : row[header] ?? "-"}
                            </TableCell>
                            )
                        )}
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {showRfmSummary && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 거래처 통합 RFM 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[300px]">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead>거래처코드</TableHead>
                    <TableHead>거래처명</TableHead>
                    <TableHead>총판매금액</TableHead>
                    <TableHead>총구매횟수</TableHead>
                    <TableHead>RFM 점수</TableHead>
                    <TableHead>최근구매일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleClientRowClick(row["거래처코드"], row["거래처명"])}
                    >
                      <TableCell>{row["거래처코드"]}</TableCell>
                      <TableCell>{row["거래처명"]}</TableCell>
                      <TableCell>{row["총판매금액"]}</TableCell>
                      <TableCell>{row["총구매횟수"]}</TableCell>
                      <TableCell>{row["rfm_score"]}</TableCell>
                      <TableCell>{row["최근구매일"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {showImportantCustomers && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>⭐ 중요 고객</CardTitle>
            <p className="text-sm text-muted-foreground">
              (R≥2: 최근 3개월내 구매 없는 고객, F≥3: 전체 구매회수 5회이상 구매있는 고객, M≥4: 전체구매금액이
              200만원이상 고객)
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-[200px] overflow-y-auto border rounded-md p-4">
              <ul className="space-y-1">
                {data.slice(0, 5).map((row, index) => (
                  <li key={index} className="text-sm border-b pb-1 mb-1 last:border-0">
                    🌟 {row["거래처명"]} (RFM: {row["rfm_score"]})
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
      {selectedClient && productRfmData.length > 0 && (
        <Card className="mt-6">
            <CardHeader>
            <CardTitle>🔍 {selectedClient.name} 제품별 RFM 상세</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>제품그룹</TableHead>
                    <TableHead>판매금액</TableHead>
                    <TableHead>구매횟수</TableHead>
                    <TableHead>RFM 점수</TableHead>
                    <TableHead>최근구매일</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {productRfmData.map((row, index) => (
                    <TableRow key={index}>
                        <TableCell>{row["구분"]}</TableCell>
                        <TableCell>{Number(row["총판매금액"] || 0).toLocaleString()}</TableCell>
                        <TableCell>{row["총구매횟수"]}</TableCell>
                        <TableCell>{row["rfm_score"]}</TableCell>
                        <TableCell>{row["최근구매일"]}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
            </CardContent>
        </Card>
      )}
    </div>
  )
}
