const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const TaskServices = require('../services/taskService'); // TaskServices 클래스 파일

require('dotenv').config();

// MySQL Connection Pool 설정
const pool = mysql.createPool({
    host: '127.0.0.1',
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

// TaskServices 인스턴스 생성
const taskService = new TaskServices(pool);

// Session test
router.get('/session', (req, res) => {
    res.json(req.session);
});

// 작업 생성
router.post('/create', async (req, res) => {
    try {
        const { title, content, priority } = req.body;
        const task = await taskService.createTask(title, content, priority, req);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 작업 완료 상태 업데이트
router.put('/complete/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { isFinished } = req.body;
        const task = await taskService.completeTask(taskId, isFinished, req);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 작업 삭제
router.delete('/delete/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await taskService.deleteTask(taskId, req);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 특정 작업 조회
router.get('/task/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const task = await taskService.getOneTask(taskId, req);
        res.status(200).json(task);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// 모든 작업 조회
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await taskService.getAllTasks(req);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 특정 날짜의 작업 조회
router.get('/daily-tasks', async (req, res) => {
    try {
        const { date } = req.query;
        const tasks = await taskService.getAllDailyTasks(date, req);
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 작업 수정
router.put('/update/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        const task = await taskService.updateTask(taskId, updates, req);
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 작업 우선순위 정렬
router.get('/sort', async (req, res) => {
    try {
        const { date } = req.query;
        const sortedTasks = await taskService.sortByPriority(date, req);
        res.status(200).json(sortedTasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
