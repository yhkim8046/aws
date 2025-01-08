require('dotenv').config(); 
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const { pool, testConnection } = require('./db'); 
const userController = require('./controllers/userController');
const taskController = require('./controllers/taskController');
const errorHandler = require('./middlewares/errorHandler');
const UserService = require('./services/userService');

const app = express();
const PORT = process.env.PORT || 3000;

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
        httpOnly: true,
        secure: false, 
        maxAge: 1000 * 60 * 15, 
      },
    })
  );

  // ----------------------------------------------------------------------------
  //  서비스/컨트롤러/라우터
  // ----------------------------------------------------------------------------
  const userService = new UserService(pool);

  app.use('/users', userController);
  app.use('/tasks', taskController);

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
