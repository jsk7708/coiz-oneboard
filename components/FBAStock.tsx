'use client'

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

// FBA 입고 수량 데이터를 위한 타입 정의
type StockRow = {
  product: string
  daily: Record<string, number>  // ex: { "3일": 5, "4일": 10, ..., "28일": 15 }
  totalQty: number
}

export default function FBAStockTable() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [open, setOpen] = useState(false)
  const [stockData, setStockData] = useState<StockRow[]>([])
  const [days, setDays] = useState<string[]>([]) 

  const years = Array.from({ length: 2 }, (_, i) => 2025 - i) // 2025, 2024
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  // 연도 및 월 선택 후 조회
  const handleYearMonthSelect = (year: number, month: number) => {
    const date = new Date(year, month - 1, 1)
    setSelectedDate(date)
    setOpen(false)
  }

  // 조회 버튼 클릭 시 API 호출
  const handleSearch = async () => {

    if (!selectedDate) {
        alert("날짜를 선택해주세요.")
        return
    }
    const month = format(selectedDate, "yyyyMM")

    const res = await fetch(`/api/sales?name=get_fba_stock_pivot_by_month&month=${month}`)
    const raw = await res.json()

    if (!Array.isArray(raw) || raw.length === 0 || !Array.isArray(raw[0])) {
        console.warn("❗ 데이터가 올바르지 않거나 없음:", raw)
        setStockData([])
        setDays([])
        return
    }

    const data = raw[0] // 실제 데이터만 추출

    // 🔍 날짜 컬럼 추출
    const allDays = new Set<string>()
    data.forEach((row: any) => {
        Object.keys(row).forEach((key) => {
        if (/^\d{1,2}일$/.test(key)) {
            allDays.add(key)
        }
        })
    })

    // 정렬된 날짜 배열로 변환
    const sortedDays = Array.from(allDays).sort((a, b) => parseInt(a) - parseInt(b))
    setDays(sortedDays)

    // 데이터 변환
    const transformed: StockRow[] = data.map((row: any) => {
        const daily: Record<string, number> = {}
        let total = 0

        sortedDays.forEach((day) => {
        const qty = Number(row[day])
        if (!isNaN(qty)) {
            daily[day] = qty
            total += qty
        }
        })

        return {
        product: row.prdname,
        daily,
        totalQty: total,
        }
    })

    setStockData(transformed)
 }


  // Excel 다운로드 기능 
  const handleExcelDownload = () => {
    if (stockData.length === 0) {
        alert("다운로드할 데이터가 없습니다.")
        return
    }

    const exportData = stockData.map((row) => {
        const rowData: any = { 품목: row.product }
        days.forEach((day) => {
        rowData[day] = row.daily[day] || ''
        })
        rowData["합계수량"] = row.totalQty
        return rowData
    })
    
    // 품목 수 계산
    const productCountRow: any = { 품목: "품목 수" }
    const totalQtyRow: any = { 품목: "수량 합계" }

    let grandTotalProductCount = 0
    let grandTotalQty = 0

    days.forEach((day) => {
      let count = 0
      let sum = 0

      stockData.forEach((row) => {
        const qty = row.daily[day] || 0
        if (qty > 0) count++
        sum += qty
      })

      productCountRow[day] = count
      totalQtyRow[day] = sum

      grandTotalProductCount += count
      grandTotalQty += sum
    })

    productCountRow["합계수량"] = grandTotalProductCount
    totalQtyRow["합계수량"] = grandTotalQty

    //하단에 두 행 추가
    exportData.push(productCountRow)
    exportData.push(totalQtyRow)


    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()

    const monthLabel = `${selectedDate!.getMonth() + 1}월재고현황`
    XLSX.utils.book_append_sheet(workbook, worksheet, `FBA ${monthLabel}`)

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const fileName = `FBA_${monthLabel}.xlsx`
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" })
    saveAs(dataBlob, fileName)

  }

  const totalProductCountByDay: Record<string, number> = {}
  const totalQtyByDay: Record<string, number> = {}
  let grandTotalQty = 0

  if (stockData.length > 0) {
    days.forEach((day) => {
      let productCount = 0
      let qtySum = 0

      stockData.forEach((row) => {
        const qty = row.daily[day] || 0
        if (qty > 0) productCount++
        qtySum += qty
      })

      totalProductCountByDay[day] = productCount
      totalQtyByDay[day] = qtySum
    })

    grandTotalQty = stockData.reduce((acc, row) => acc + row.totalQty, 0)
  }
  
  const grandTotalProductCount = days.reduce(
    (sum, day) => sum + (totalProductCountByDay[day] ?? 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* 조회 조건 영역 */}
      <div className="flex items-end gap-4 px-4 pt-4">
        <div className="w-64">
          <label className="block text-sm mb-2">조회 연월</label>
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

        <Button onClick={handleSearch}>조회</Button>
        <Button onClick={handleExcelDownload} variant="outline">Excel 다운로드</Button>
      </div>

      {/* 재고 테이블 */}
      <div className="px-4 pb-8">
      <div className="overflow-auto mt-10">
        <Table className="min-w-[1200px] border border-gray-300 border-collapse">
          <TableHeader>
            <TableRow className="border-b border-gray-300">
                <TableHead className="border-r border-gray-300 text-left">품목</TableHead>
                {days.map((day) => (
                <TableHead
                    key={day}
                    className="border-r border-gray-300 text-center whitespace-nowrap"
                >
                    {day}
                </TableHead>
                ))}
                <TableHead
                    className={`text-center font-bold ${
                        stockData.length > 0 ? 'bg-yellow-100 text-yellow-900' : ''
                    }`}
                    >
                    합계수량
                </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockData.length > 0 ? (
              <>
                {stockData.map((row) => (
                <TableRow key={row.product} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200">{row.product}</TableCell>
                    {days.map((day) => (
                    <TableCell key={day} className="text-right border-r border-gray-200">
                        {row.daily[day] || ''}
                    </TableCell>
                    ))}
                    <TableCell className="font-bold text-right bg-yellow-100 text-yellow-900">{row.totalQty}</TableCell>
                </TableRow>
                ))}
                {/* 품목 수 */}
                <TableRow className="bg-gray-50">
                  <TableCell className="border-r font-semibold">품목 수</TableCell>
                  {days.map((day) => (
                    <TableCell key={day} className="text-right border-r">
                      {totalProductCountByDay[day] ?? 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-right bg-yellow-200 text-yellow-900 font-bold"> {grandTotalProductCount}</TableCell>
                </TableRow>

                {/* 수량 합계 */}
                <TableRow className="bg-gray-100">
                  <TableCell className="border-r font-semibold">수량 합계</TableCell>
                  {days.map((day) => (
                    <TableCell key={day} className="text-right border-r font-semibold">
                      {totalQtyByDay[day] ?? 0}
                    </TableCell>
                  ))}
                  <TableCell className="text-right bg-yellow-200 text-yellow-900 font-bold">{grandTotalQty}</TableCell>
                </TableRow>
              </>
            ) : (
                <TableRow>
                <TableCell
                    colSpan={days.length + 2}
                    className="text-center py-6 text-gray-400"
                >
                    데이터가 없습니다.
                </TableCell>
                </TableRow>
            )}
         </TableBody>
        </Table>
      </div>
      </div>
    </div>
  )
}
