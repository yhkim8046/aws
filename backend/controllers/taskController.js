// controllers/taskController.js
const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middlewares/auth');  // 인증 미들웨어
const TaskServices = require('../services/taskService');
const { pool } = require('../db');
const asyncWrapper = require('../utils/asyncWrapper'); // 비동기 에러 핸들링용

// 서비스 인스턴스
const taskService = new TaskServices(pool);

// ---------------------------------------------
// 작업 생성
// POST /tasks/create
// ---------------------------------------------
router.post('/create',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id; 
    const { title, content, priority } = req.body;

    if (!title || !content || priority == null) {
      return res.status(400).json({ error: 'title, content, priority are required' });
    }

    const task = await taskService.createTask(title, content, priority, userId);
    return res.status(200).json({ message: 'Task created successfully', task });
  })
);

// ---------------------------------------------
// 작업 완료 설정
// PUT /tasks/complete/:taskId
// ---------------------------------------------
router.put('/complete/:taskId',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    const { taskId } = req.params;
    const { isFinished } = req.body;

    const updatedTask = await taskService.completeTask(taskId, isFinished, userId);
    return res.status(200).json(updatedTask);
  })
);

// ---------------------------------------------
// 작업 삭제
// DELETE /tasks/delete/:taskId
// ---------------------------------------------
router.delete('/delete/:taskId',requireAuth,asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    const { taskId } = req.params;

    const result = await taskService.deleteTask(taskId, userId);
    return res.status(200).json(result);
  })
);

// ---------------------------------------------
// 특정 작업 조회
// GET /tasks/task/:taskId
// ---------------------------------------------
router.get('/task/:taskId',requireAuth,asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    const { taskId } = req.params;

    const task = await taskService.getOneTask(taskId, userId);
    return res.status(200).json(task);
  })
);

// ---------------------------------------------
// 전체 작업 조회
// GET /tasks
// ---------------------------------------------
router.get('/',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    const tasks = await taskService.getAllTasks(userId);
    return res.status(200).json(tasks);
  })
);

// ---------------------------------------------
// 특정 날짜의 작업 조회
// GET /tasks/daily-tasks?date=YYYY-MM-DD
// ---------------------------------------------
router.get('/daily-tasks',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query param is required' });
    }

    const tasks = await taskService.getAllDailyTasks(date, userId);
    return res.status(200).json(tasks);
  })
);

// ---------------------------------------------
// 작업 수정
// PUT /tasks/update/:taskId
// ---------------------------------------------
router.put('/update/:taskId',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    const { taskId } = req.params;
    const updates = req.body; // { title, content, priority... }

    const updated = await taskService.updateTask(taskId, updates, userId);
    return res.status(200).json(updated);
  })
);

// ---------------------------------------------
// 작업 우선순위 정렬
// GET /tasks/sort?date=YYYY-MM-DD
// ---------------------------------------------
router.get('/sort',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query param is required' });
    }

    const sortedTasks = await taskService.sortByPriority(date, userId);
    return res.status(200).json(sortedTasks);
  })
);

module.exports = router;
