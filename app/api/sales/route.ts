// app/api/sales/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// 환경 변수에서 DB 정보 로드
const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  charset: 'utf8mb4',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'name 파라미터가 필요합니다.' }, { status: 400 });
  }

  const conn = await mysql.createConnection(DB_CONFIG);

  try {
    let rows: any = [];

    switch (name) {
      case 'ecount_guide':
        [rows] = await conn.query('CALL EcountApiGuide()');
        break;
      case 'get_new_customers':
        [rows] = await conn.query('CALL GetNewClientsSales(?)', [searchParams.get('year_month')]);
        break;
      case 'get_year_product_sales':
        [rows] = await conn.query('CALL GetSalesSummaryByYear(?)', [searchParams.get('year')]);
        break;
      case 'get_yearly_sales':
        [rows] = await conn.query('CALL GetAnnualSalesSummary()');
        break;
      case 'get_product_sales':
        [rows] = await conn.query('CALL GetProductSalesSummaryByYear(?)', [searchParams.get('product_id')]);
        break;
      case 'get_year_customers':
        [rows] = await conn.query('CALL GetClientSalesSummaryByMonth(?, ?)', [
          searchParams.get('year'),
          searchParams.get('clientName')
        ]);
        break;
      case 'get_year_product_best_sales':
        [rows] = await conn.query('CALL GetProductMonthlySalesByYear(?)', [searchParams.get('year')]);
        break;
      case 'call_proc_new_customer_year':
        [rows] = await conn.query('CALL proc_insert_select_by_year(?)', [searchParams.get('year')]);
        break;
      case 'get_manager_customer':
        [rows] = await conn.query('CALL GetManagerMonthlySalesByYear(?)', [searchParams.get('year')]);
        break;
      case 'get_manager_sales':
        [rows] = await conn.query('CALL GetManagerMonthlySalesAmountByYear(?)', [searchParams.get('year')]);
        break;
      case 'get_manager_sales_by_date':
        [rows] = await conn.query('CALL GetManagerTotalSalesByPeriod(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date')
        ]);
        break;
      case 'get_year_customers_product':
        [rows] = await conn.query('CALL GetClientPrdSalesSummaryByMonth(?, ?)', [
          searchParams.get('year'),
          searchParams.get('clientName')
        ]);
        break;
      case 'get_year_customers_prdQty':
        [rows] = await conn.query('CALL GetClientPrdQtySummaryByMonth(?, ?)', [
          searchParams.get('year'),
          searchParams.get('clientName')
        ]);
        break;
      case 'get_year_monthly_sales':
        [rows] = await conn.query('CALL sales_summary_by_year()');
        break;
      case 'get_monthly_product_best':
        [rows] = await conn.query('CALL GetProductSales(?)', [searchParams.get('year_month')]);
        break;
      case 'get_TeamSales_Summary':
        [rows] = await conn.query('CALL GetSalesTeamSummary()');
        break;
      case 'get_new_customers_prd':
        [rows] = await conn.query('CALL GetNewClientPrdSales(?)', [searchParams.get('year_month')]);
        break;
      case 'getMonthlyRegularNewCustomer':
        [rows] = await conn.query('CALL getMonthlyRegularNewCustomer_New(?)', [searchParams.get('year')]);
        break;
      case 'get_year_MC_sales':
        [rows] = await conn.query('CALL GetMCSalesSummaryByYear(?)', [searchParams.get('year')]);
        break;
      case 'get_year_SubMaterial_sales':
        [rows] = await conn.query('CALL SubMaterialSupplies(?)', [searchParams.get('year')]);
        break;
      case 'get_year_prdGroup_sales':
        [rows] = await conn.query('CALL GetSumProductGroup(?)', [searchParams.get('year')]);
        break;
      case 'get_churn_customer_report':
        [rows] = await conn.query('CALL get_churn_customer_report(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date')
        ]);
        break;
      case 'get_manager_churn_report':
        [rows] = await conn.query('CALL get_manager_churn_report(?, ?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
          searchParams.get('emp_name')
        ]);
        break;
      case 'get_product_sales_trend_by_date':
        [rows] = await conn.query('CALL get_product_sales_trend_by_date(?, ?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
          searchParams.get('product_id')
        ]);
        break;
      case 'get_customer_purchase_summary':
        [rows] = await conn.query('CALL get_customer_purchase_summary(?, ?,?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
          searchParams.get('clientName'),
          
        ]);
        break;
      case 'get_lost_customers_by_manager':
        [rows] = await conn.query('CALL sp_get_lost_customers_by_manager_total(?, ?)', [
          searchParams.get('emp_name'),
          Number(searchParams.get('p_limit') || '100'),
        ]);
        break;
      case 'get_clientPrdSales_summary':
        [rows] = await conn.query('CALL GetClient_ProductSalesSummary(?, ?)', [
          searchParams.get('product_id'),
          searchParams.get('clientName'),
        ]);
        break;
      case 'get_AnalyzeTopClientByProduct':
        [rows] = await conn.query('CALL AnalyzeTopClientsByProduct(?)', [searchParams.get('product_id')]);
        break;
      case 'get_productMonthlySales':
        [rows] = await conn.query('CALL GetProductMonthlySalesByKeyword(?)', [
           searchParams.get('year'),
           searchParams.get('product_id'),

        ]);
        break;  
      case 'get_product_rfm_by_client':
        [rows] = await conn.query('CALL sp_get_lost_customers_by_manager(?)', [searchParams.get('client_code')]);
        break;
      case 'get_TotalSalesByPeriod':
        [rows] = await conn.query('CALL GetTotalSalesByPeriod(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;  
      case 'get_sales_by_year_monthly':
        [rows] = await conn.query('CALL sales_by_year_monthly_new(?)', [
          searchParams.get('year'),
        ]);
        break; 
      case 'get_Total_TeamSalesByPeriod':
        [rows] = await conn.query('CALL GetTotalTeamSalesByPeriod(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break; 
      case 'get_MallSalesWithYoY':
        [rows] = await conn.query('CALL sp_getMallSalesWithYoY(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;  
      case 'get_AvgSalesPerClientWithYo':
        [rows] = await conn.query('CALL sp_getAvgSalesPerClientWithYoY(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break; 
      case 'get_SalesClientWithYoY':
        [rows] = await conn.query('CALL sp_getSalesClientWithYoY(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break; 
      case 'get_LostClientsByTeam':
        [rows] = await conn.query('CALL sp_getLostClientsByTeam(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;    
      case 'get_SalesByPrdGroupWithAbs':
        [rows] = await conn.query('CALL sp_getSalesByPrdGroupWithAbs(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break; 
      case 'get_TopProducts':
        [rows] = await conn.query('CALL sp_getTopProductsByQty_Products(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;  
      case 'get_TopDevices':
        [rows] = await conn.query('CALL sp_getTopProductsByQty_Devices(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;
      case 'get_daily_sales':
        [rows] = await conn.query('CALL sp_get_daily_sales_comparison_by_range(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;    
      case 'get_nxClient_sales':
        [rows] = await conn.query('CALL sp_sales_nx_summary(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;    
      case 'get_team_sales_with_team_last_year':
        [rows] = await conn.query('CALL sp_get_team_sales_with_team_last_year(?)', [
          searchParams.get('year'),
        ]);
        break;  
      case 'get_Teamdaily_sales':
        [rows] = await conn.query('CALL sp_get_Teamdaily_sales_comparison_by_range(?, ?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
          searchParams.get('team'),
        ]);
        break; 
      case 'get_TopProducts_Online':
        [rows] = await conn.query('CALL sp_get_top10_online_sales_summary(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;  
      case 'get_TopProducts_offline':
        [rows] = await conn.query('CALL sp_get_top10_offline_sales_summary(?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
        ]);
        break;  
      case 'get_TopProducts_Team':
        [rows] = await conn.query('CALL sp_get_team_top10_sales(?, ?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
          searchParams.get('team'),
        ]);
        break;  
      case 'get_TopDevices_Team':
        [rows] = await conn.query('CALL sp_get_team_top10_Dsales(?, ?, ?)', [
          searchParams.get('start_date'),
          searchParams.get('end_date'),
          searchParams.get('team'),
        ]);
        break;  
      case 'get_all_member_job_info':
        [rows] = await conn.query('CALL sp_get_coiz_member_job_info_by_team(?)', [
          searchParams.get('team'),
        ]);
        break;  
      case 'verify_member_password':
        [rows] = await conn.query('CALL sp_verify_coiz_member_pwd(?,?,?)', [
          searchParams.get('member_name'),
          searchParams.get('team_name'),
          searchParams.get('password'),
        ]);
        break; 
      case 'get_member_job_info':
        [rows] = await conn.query('CALL sp_verify_coiz_member_info(?,?)', [
          searchParams.get('member'),
          searchParams.get('team'),
        ]);
        break;   
      case 'get_tool_sales_pivot_by_client':
        [rows] = await conn.query('CALL sp_tool_sales_pivot_by_client(?,?)', [
          searchParams.get('clientName'),
          searchParams.get('month'),
        ]);
        break;  
       case 'get_fba_stock_pivot_by_month':
        [rows] = await conn.query('CALL sp_fba_stock_pivot_by_month(?)', [
            searchParams.get('month'),
        ]);
        break;   
      default:
        return NextResponse.json({ error: `알 수 없는 name: ${name}` }, { status: 400 });
    }

    return NextResponse.json(rows);
  } catch (err: any) {
    console.error('❌ DB 오류:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await conn.end();
  }
}
