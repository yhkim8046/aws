const mysql = require('mysql2/promise');
require('dotenv').config(); // .env 로드

// ① Pool 생성
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

// ② DB 연결 테스트 함수
async function testConnection() {
  const connection = await pool.getConnection();
  const [rows] = await connection.query('SELECT NOW() AS now');
  console.log('Database connected successfully. Time:', rows[0].now);
  connection.release();
}

// ③ Pool과 테스트 함수 내보내기
module.exports = { pool, testConnection };
