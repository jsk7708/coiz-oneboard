import pandas as pd
import pymysql
import re
from datetime import datetime
import configparser
import os

# 1. config.ini에서 DB 정보 읽기
config = configparser.ConfigParser()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
config.read(os.path.join(BASE_DIR, "fba_loader_config.ini"))

print("✅ INI 파일에서 읽은 섹션 목록:", config.sections())

DB_CONFIG = {
    'host': config["mysql"]["host"],
    'user': config["mysql"]["user"],
    'password': config["mysql"]["password"],
    'database': config["mysql"]["database"],
    'port': int(config["mysql"]["port"]),
    'charset': 'utf8mb4'
}

# 2. 엑셀 파일 경로
excel_path = os.path.join(BASE_DIR, "StockHistoryListScreenReport.xlsx")  # 또는 자동 다운로드 경로 지정

if not os.path.exists(excel_path):
    print(f"❌ 파일이 존재하지 않습니다: {excel_path}")
    exit()

# 3. 엑셀 로드
df = pd.read_excel(excel_path)

# 4. 'FBA-' 포함된 행만 추출
fba_df = df[
    df['Transaction details'].str.contains("FBA-|FBALabel -", na=False)
].copy()

# 5. 데이터 정리
fba_df["stock_date"] = pd.to_datetime(fba_df["Record date"]).dt.date
fba_df["transaction_time"] = pd.to_datetime(fba_df["Transaction timestamp"])
fba_df["qty"] = fba_df["Quantity"].abs().astype(int)

# 6. 컬럼명 매핑
fba_df = fba_df.rename(columns={
    "Product ID": "sku",
    "Description": "prdname",
    "Transaction": "transaction_type",
    "Transaction details": "transaction_detail"
})[["prdname", "sku", "stock_date", "qty", "transaction_type", "transaction_detail", "transaction_time"]]

# 7. DB 연결
conn = pymysql.connect(**DB_CONFIG)
cursor = conn.cursor()

insert_sql = """
INSERT INTO fba_stock_daily (
  prdname, sku, stock_date, qty,
  transaction_type, transaction_detail, transaction_time
) VALUES (%s, %s, %s, %s, %s, %s, %s)
"""

# 8. INSERT 실행
for _, row in fba_df.iterrows():
    cursor.execute(insert_sql, (
        row["prdname"],
        row["sku"],
        row["stock_date"],
        row["qty"],
        row["transaction_type"],
        row["transaction_detail"],
        row["transaction_time"]
    ))

conn.commit()
cursor.close()
conn.close()

print("✅ FBA 입고 이력 DB 저장 완료!")
