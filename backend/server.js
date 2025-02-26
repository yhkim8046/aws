require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const cors = require('cors');

const { pool, testConnection } = require('./db'); 
const userController = require('./controllers/userController');
const taskController = require('./controllers/taskController');
const errorHandler = require('./middlewares/errorHandler');
const UserService = require('./services/userService');

const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// setup.sql 실행 함수
async function executeSetupSQL() {
  try {
    const sqlPath = path.join(__dirname, 'setup.sql'); // setup.sql 경로 설정
    const sql = await fs.readFile(sqlPath, 'utf8'); // SQL 파일 읽기
    const connection = await pool.getConnection(); // DB 연결 가져오기
    await connection.query(sql); // SQL 실행
    connection.release(); // 연결 해제
    console.log('setup.sql executed successfully.');
  } catch (err) {
    console.error('Failed to execute setup.sql:', err.message);
    throw err; // 실패 시 오류를 던져 서버 시작 중단
  }
}

// ----------------------------------------------------------------------------
// DB 테스트 & 서버 시작 (비동기 함수)
// ----------------------------------------------------------------------------
async function startServer() {
  try {
    // (선택) DB 연결 테스트
    await testConnection(); 
  } catch (err) {
    console.error('Failed to connect to the database:', err.message);
    process.exit(1); // DB 연결 실패 시 서버 구동 안 함
  }

  // ----------------------------------------------------------------------------
  // 미들웨어 설정
  // ----------------------------------------------------------------------------
  app.use(express.json()); // body parsing

  // 세션 스토어 설정
  const sessionStore = new MySQLStore({}, pool);
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || 'default_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        secure: false, 
        maxAge: 1000 * 60 * 15, 
      },
    })
  );

  // ----------------------------------------------------------------------------
  //  서비스/컨트롤러/라우터
  // ----------------------------------------------------------------------------
  const userService = new UserService(pool);

  app.use('/user', userController);
  app.use('/dashboard', taskController);

  // 헬스체크 엔드포인트
  app.get('/health', async (req, res) => {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT NOW() AS now');
      res.status(200).json({ status: 'success', databaseTime: rows[0].now });
      connection.release();
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: err.message,
      });
    }
  });

  // 에러 핸들러
  app.use(errorHandler);

  // ----------------------------------------------------------------------------
  // 서버 시작
  // ----------------------------------------------------------------------------
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('DB HOST:', process.env.MYSQL_HOST);
    console.log('DB PORT:', process.env.MYSQL_PORT);
    console.log('DB USER:', process.env.MYSQL_USER);
    console.log('DB PASSWORD:', process.env.MYSQL_PASSWORD);
    console.log('DB DATABASE:', process.env.MYSQL_DATABASE);
  });
}

// 실제 실행
startServer();
