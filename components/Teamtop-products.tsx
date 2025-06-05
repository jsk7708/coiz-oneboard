"use client"

import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

type Props = {
  dateRange: DateRange | undefined;
}

type ProductItem = {
  prdname: string;
  sales_total: number;
  percentage: number;
  type: "제품" | "기기";
};

export function TopProducts({ dateRange }: Props) {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("임상");

  useEffect(() => {
    if (!dateRange?.from || !dateRange?.to) return;

    const start = format(dateRange.from, "yyyyMMdd");
    const end = format(dateRange.to, "yyyyMMdd");

    const fetchAndProcess = async (apiName: string, label: "제품" | "기기"): Promise<ProductItem[]> => {
      try {
        const res = await fetch(`/api/sales?name=${apiName}&start_date=${start}&end_date=${end}&team=${selectedTeam}`);
        const json = await res.json();
        const result = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : Array.isArray(json) ? json : [];

        const max = Number(result[0]?.sales_total ?? 1);

        return result.map((item: any) => {
          const salesTotal = Number(item.sales_total ?? 0);
          return {
            prdname: item.prdname ?? "이름 없음",
            sales_total: salesTotal,
            percentage: Math.round((salesTotal / max) * 100),
            type: label,
          };
        });
      } catch (err) {
        console.error(`${label} 인기 상품 API 오류`, err);
        return [];
      }
    };

    const loadData = async () => {
      const products = await fetchAndProcess("get_TopProducts_Team", "제품");
      const devices = await fetchAndProcess("get_TopDevices_Team", "기기");
      setItems([...products, ...devices]);
    };

    loadData();
  }, [dateRange, selectedTeam]);

  return (
    <div className="space-y-6">
      {/* 팀 선택 박스 */}
      <div className="flex items-center gap-2">
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
          <option value="상해">상해</option>
          <option value="영어">영어</option>
          <option value="중국">중국</option>
          <option value="카페24(코이즈몰)">카페24(코이즈몰)</option>
          <option value="카페24(슈티몰)">카페24(슈티몰)</option>
          <option value="스토어팜(슈티컬스)">스토어팜(슈티컬스)</option>
          <option value="스토어팜(셀본)">스토어팜(셀본)</option>
          <option value="지그재그">지그재그</option>
          <option value="카카오톡스토어">카카오톡스토어</option>
          <option value="화해">화해</option>
          <option value="쿠팡">쿠팡</option>
          <option value="메이크샵(셀본)">메이크샵(셀본)</option>
          <option value="(주)하루메디칼투어">(주)하루메디칼투어</option>
          <option value="(주)에스제이코비스">(주)에스제이코비스</option>
          <option value="(주)호텔신라">(주)호텔신라</option>


        </select>
      </div>

      {/* 제품/기기 목록 */}
      {["제품", "기기"].map((group) => (
        <div key={group} className="mb-4">
          <h4 className="font-semibold text-sm md:text-base mb-2">{group}</h4>
          {items
            .filter((item) => item.type === group)
            .map((item, idx) => (
              <div key={`${group}-${idx}`} className="space-y-1">
                <div className="text-sm md:text-base">
                  <div className="whitespace-normal break-words leading-snug">{item.prdname}</div>
                  <div className="text-right text-xs md:text-sm text-muted-foreground">
                    {(item.sales_total ?? 0).toLocaleString()}개
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2 mt-1" />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
