import mysql from 'mysql2/promise';

// สร้าง Connection Pool สำหรับ MySQL
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'pr_dt_1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ฟังก์ชัน helper สำหรับรัน Query
export async function executeQuery<T = any>(query: string, values: any[] = []): Promise<T> {
  try {
    const [rows] = await mysqlPool.execute(query, values);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    //  แก้ไขบรรทัดนี้เพื่อส่ง Error จริงจาก MySQL ออกไป
    throw error;
  }
}

export default mysqlPool;