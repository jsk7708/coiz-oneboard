// app/api/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const DB_CONFIG = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  charset: 'utf8mb4',
};

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const api = payload.api;

  if (!api) {
    return NextResponse.json({ error: 'api 파라미터가 필요합니다.' }, { status: 400 });
  }

  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    let result;

    switch (api) {
      // 첫 번째 프로시저
      case 'post_save_coiz_member_job_info': {
        const {
          member_name,
          team_name,
          task,
          performance,
          goal,
          hope,
          suggestion,
          skill,
          password
        } = payload;

        [result] = await conn.query(
          'CALL sp_save_coiz_member_job_info(?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [member_name, team_name, task, performance, goal, hope, suggestion, skill, password]
        );
        break;
      }

      // 두 번째 프로시저
      case 'save_simple_status': {
        const { member_name, status } = payload;

        [result] = await conn.query(
          'CALL sp_save_status(?, ?)',
          [member_name, status]
        );
        break;
      }

      default:
        return NextResponse.json({ error: `알 수 없는 API 요청: ${api}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('❌ DB 오류:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await conn.end();
  }
}
