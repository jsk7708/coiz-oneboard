//import MainTabs from "@/components/MainTabs";

//export default function Home() {
//  return (
//    <main className="container mx-auto py-10 px-4">
//      <h1 className="text-3xl font-bold mb-6">COIZ 판매데이터 시스템</h1>
//      <MainTabs />
//    </main>
//  );
//}

import type { Metadata } from "next"
import DashboardPage from "@/components/dashboard-page"

export const metadata: Metadata = {
  title: "Coiz OneBoard System",
  description: "이카운트 판매데이터를 분석하고 시각화 한 BI 시스템& Coiz Business 시스템",
}

export default function Home() {
  return <DashboardPage />
}
