
"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"

type Props = {
  dateRange: DateRange | undefined;
}



export function RecentSales({ dateRange }: Props) {
  type TeamLostClientType = {
    Team: string;
    client_name: string;
    sales_total: number;
    purchase_count: number;
    last_purchase_date: string;
  };

  const [teamLostClientData, setTeamLostClientData] = useState<TeamLostClientType[]>([]);
  

  useEffect(() => {
    const fetchLostClients = async () => {
      if (!dateRange?.from || !dateRange?.to) return;

      const start = format(dateRange.from, "yyyyMMdd");
      const end = format(dateRange.to, "yyyyMMdd");

      try {
        const res = await fetch(`/api/sales?name=get_LostClientsByTeam&start_date=${start}&end_date=${end}`);
        const json = await res.json();
        const result = Array.isArray(json) && Array.isArray(json[0]) ? json[0] : json;

        setTeamLostClientData(result);
      } catch (err) {
        console.error("📉 이탈 고객 조회 오류", err);
      }
    };

    fetchLostClients();
  }, [dateRange]);

    
return (
<div className="space-y-2">
    {teamLostClientData.map((item, index) => (
    <div key={`${item.Team}-${index}`} className="flex items-center">
        <div className="ml-4 space-y-1">
        <p className="text-sm font-medium leading-none">{item.client_name}</p>
        <p className="text-xs text-muted-foreground">
            {item.Team} / {item.purchase_count}회 / {format(new Date(item.last_purchase_date), "yyyy-MM-dd")}
        </p>
        </div>
        <div className="ml-auto font-medium text-sm">
        ₩{Number(item.sales_total).toLocaleString()}
        </div>
    </div>
    ))}
</div>
)
}

