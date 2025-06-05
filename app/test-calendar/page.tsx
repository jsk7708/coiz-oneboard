"use client"

import { useState } from "react"
import { DayPicker, DateRange } from "react-day-picker"
import "react-day-picker/dist/style.css"

export default function CalendarRangePicker() {
  const [range, setRange] = useState<DateRange | undefined>()

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📅 날짜 범위 선택</h2>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
      />

      {range?.from && range?.to && (
        <p className="mt-4 font-medium">
          선택한 범위: {range.from.toLocaleDateString()} ~ {range.to.toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
