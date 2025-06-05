"use client"

import { useState , useRef  } from "react"
import { format, set } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"


type ToolSalesItem = {
  prdname: string
  공급가?: number
  [key: string]: string | number | undefined
}

const clientOptions = [
  { label: "주식회사 하임홀딩스", value: "주식회사 하임홀딩스" },
  { label: "굿트리컴퍼니", value: "굿트리컴퍼니" },
  { label: "쇼균브릿지", value: "쇼균브릿지" },
]

export default function ToolSalesPivotTab() {
  const [clientName, setClientName] = useState("")
  const [data, setData] = useState<ToolSalesItem[]>([])
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const handleSearch = async () => {
     if (!clientName) {
        alert("⚠️ 거래처를 선택하세요.")
        return
    }

    if (!selectedDate) {
        alert("⚠️ 조회 연월을 선택하세요.")
        return
    }
    const month = format(selectedDate, "yyyyMM")

    try {
      const res = await fetch(`/api/sales?name=get_tool_sales_pivot_by_client&clientName=${clientName}&month=${month}`)
      const json = await res.json()
      const rows = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json
      setData(rows)
    } catch (err) {
      console.error("공구 판매 데이터 로드 실패", err)
    }
  }

  const years = Array.from({ length: 2 }, (_, i) => 2025 - i) // 2025, 2024, 2023, 2022
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const handleYearMonthSelect = (year: number, month: number) => {
    const fixedDate = set(new Date(), { year, month: month - 1, date: 1 })
    setSelectedDate(fixedDate)
    setOpen(false)
  }

 let previousSeller: string | null = null;

 const renderRows = (rows: ToolSalesItem[]) => {
    return rows.map((row, i) => {
        const currentSeller = row["셀러명"] as string;  // 타입 단언
        const sellerDisplay = currentSeller === previousSeller ? "" : currentSeller;
        previousSeller = currentSeller;  

        const keys = Object.keys(row)

        return (
        <tr key={i} className="border-t">
            {keys.map((key, j) => {
            const val = row[key]
            const isTotalRow = row["품목"] === "총매출"
            const isDateCol = key.endsWith("일")
            const isQtyCol = key === "합계수량"
            const isTotalAmountCol = key === "총금액"
            const isFirstDateCol = isDateCol && keys.findIndex(k => k.endsWith("일")) === j
            const dateColCount = keys.filter(k => k.endsWith("일")).length

            //  총매출 행에서 날짜 첫번째 셀만 colSpan으로 렌더링
            if (isTotalRow) {
                if (key === "품목") {
                return (
                <td key={j} className="text-right font-semibold text-red-500 border">
                    총매출
                </td>
                )
            }

                if (isQtyCol) return null // 합계수량 숨김

                if (isDateCol && isFirstDateCol) {
                // 총금액 값 가져오기
                const totalAmount = row["총금액"];
                const numericTotal = !isNaN(Number(totalAmount)) ? Number(totalAmount) : null;

                return (
                <td key={j} colSpan={dateColCount + 2} className="text-center bg-orange-50 font-semibold text-red-500 border">
                    {numericTotal !== null ? numericTotal.toLocaleString("ko-KR") : ""}
                </td>
                );
                }

                if (isDateCol && !isFirstDateCol) return null // 날짜 중복 셀 숨김
                if (isTotalAmountCol) return null;


                // 나머지 (셀러명 등)
                return (
                <td key={j} className="text-right border">
                    {val}
                </td>
                )
            }

            // 일반 행
            const numericVal = !isNaN(Number(val)) ? Number(val) : null
            const showEmpty = isDateCol && numericVal === 0
            const isRedText = key === "품목" && row["품목"] === "총매출"
            const isOrangeAmount =
                key === "총금액" &&
                (row["품목"] === "합계수량" || row["품목"] === "택배비")
            const displayVal =
                key === "셀러명"
                ? sellerDisplay
                : showEmpty
                ? ""
                : numericVal !== null
                ? numericVal.toLocaleString("ko-KR")
                : val ?? ""

            return (
                <td
                key={j}
                className={cn(
                    "px-3 py-1 border text-right",
                    showEmpty && "bg-gray-100 text-gray-400",
                    isOrangeAmount && "bg-orange-100 font-semibold",
                    isRedText && "text-red-500 font-semibold"
                )}
                >
                {displayVal}
                </td>
            )
            })}
        </tr>
        )
    })
    }
    
    const handleExcelDownload = () => {
    if (data.length === 0) {
        alert("데이터가 없습니다.")
        return
    }

    // 데이터 가공 (셀러명 중복 제거 포함)
    let previousSeller: string | null = null
    const exportData = data.map((row) => {
        const rowCopy: Record<string, any> = { ...row }
        if (rowCopy["셀러명"] === previousSeller) {
        rowCopy["셀러명"] = ""
        } else {
        previousSeller = rowCopy["셀러명"] as string
        }
        return rowCopy
    })

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "판매데이터")

    // 엑셀 파일로 저장
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" })
    saveAs(blob, `공구(셀러)일자별_sales_${format(selectedDate ?? new Date(), "yyyyMM")}.xlsx`)
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>공구/셀러 검색월 일자별 판매 분석</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-64">
            <label className="block text-sm mb-1">거래처 선택</label>
            <Select value={clientName} onValueChange={setClientName}>
              <SelectTrigger>
                <SelectValue placeholder="거래처를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {clientOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-64">
            <label className="block text-sm mb-1">조회 연월</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Input
                  readOnly
                  value={selectedDate ? format(selectedDate, "yyyy-MM") : ""}
                  onClick={() => setOpen(true)}
                  placeholder="YYYY-MM 선택"
                  className="cursor-pointer"
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4">
                <div className="grid grid-cols-1 gap-4">
                  {years.map((y) => (
                    <div key={y}>
                      <div className="font-semibold mb-2">{y}년</div>
                      <div className="grid grid-cols-4 gap-2">
                        {months.map((m) => (
                          <Button
                            key={m}
                            variant="ghost"
                            className="px-2 py-1"
                            onClick={() => handleYearMonthSelect(y, m)}
                          >
                            {m}월
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSearch} className="mt-6 md:mt-0">
            조회
          </Button>
          <Button onClick={handleExcelDownload} className="mt-6 md:mt-0" variant="outline">
            Excel 다운로드
          </Button>
        </div>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                {data[0] &&
                  Object.keys(data[0]).map((col, idx) => (
                    <th key={idx} className="px-3 py-2 whitespace-nowrap font-semibold border">
                      {col}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? renderRows(data) : (
                <tr>
                  <td colSpan={999} className="text-center py-6 text-muted-foreground">
                    조회된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
  
