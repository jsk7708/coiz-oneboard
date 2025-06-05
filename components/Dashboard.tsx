export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">📊 판매 데이터 대시보드</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl shadow p-4">
          <h3 className="font-medium">총 매출</h3>
          <p className="text-xl font-bold">₩123,456,789</p>
        </div>
        <div className="rounded-xl shadow p-4">
          <h3 className="font-medium">신규 고객</h3>
          <p className="text-xl font-bold">+573</p>
        </div>
      </div>
      <div className="rounded-xl shadow p-4">
        <h3 className="font-medium mb-2">월별 매출 추이</h3>
        <p>(차트 컴포넌트 자리)</p>
      </div>
    </div>
  );
}
