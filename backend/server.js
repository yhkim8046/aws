const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); // MySQL용 모듈
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); // MySQL 세션 스토리지
const userController = require('./controllers/userController');
const taskController = require('./controllers/taskController');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Database connection
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

// Test database connection
(async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users');
        console.log('Database connected successfully.', rows);
        connection.release(); // 연결 해제
    } catch (err) {
        console.error('Failed to connect to the database:', err.message);
        process.exit(1); // 데이터베이스 연결 실패 시 프로세스 종료
    }
})();

// Port setup
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Session setup
const sessionStore = new MySQLStore({}, pool); // MySQL 세션 스토리지 설정
app.use(
    session({
        store: sessionStore, // MySQL 세션 스토리지 사용
        secret: process.env.SESSION_SECRET, // 안전한 비밀 키
        resave: false, // 수정되지 않은 세션 저장 안 함
        saveUninitialized: false, // 초기화되지 않은 세션 저장 안 함
        cookie: {
            httpOnly: true, // XSS 방지
            secure: false, // HTTPS에서만 작동 (개발 환경에서는 false)
            maxAge: 1000 * 60 * 15, // 세션 만료 시간 (15분)
        },
    })
);

// Routes
app.use('/users', userController);
app.use('/tasks', taskController);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT NOW() AS now');
        res.status(200).json({ status: 'success', databaseTime: rows[0].now });
        connection.release();
    } catch (err) {
        res.status(500).json({ status: 'error', message: 'Database connection failed', error: err.message });
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, Node.js Server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//DB connection log
console.log('DB HOST:', process.env.MYSQL_HOST);
console.log('DB PORT:', process.env.MYSQL_PORT);
console.log('DB USER:', process.env.MYSQL_USER);
console.log('DB PASSWORD:', process.env.MYSQL_PASSWORD);
console.log('DB DATABASE:', process.env.MYSQL_DATABASE);

(async () => {
    try {
      const [rows] = await pool.query('SELECT version() AS v');
      console.log('Database version:', rows[0].v);
    } catch (err) {
      console.error('Error checking DB version:', err.message);
    }
  })();
  