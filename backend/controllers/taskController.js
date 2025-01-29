const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middlewares/auth');  // 인증 미들웨어
const TaskServices = require('../services/taskService');
const { pool } = require('../db');
const asyncWrapper = require('../utils/asyncWrapper'); // 비동기 에러 핸들링용

// 서비스 인스턴스
const taskService = new TaskServices(pool);

//할 일 생성
router.post('/create',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;

    if(!userId){
      return res.redirect('/user/login');
    }

    const {content} = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const task = await taskService.createTask(content, userId);
    return res.status(200).json({ message: 'Task created successfully', task });
  })
);

//할일 완료 
router.put('/complete/:taskId',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    if(!userId){
      return res.redirect('/user/login');
    }
    const { taskId } = req.params;
    const { isFinished } = req.body;

    const updatedTask = await taskService.completeTask(taskId, isFinished, userId);
    return res.status(200).json(updatedTask);
  })
);

//할 일 삭제 
router.delete('/delete/:taskId',requireAuth,asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    if(!userId){
      return res.redirect('/user/login');
    }
    const { taskId } = req.params;

    const result = await taskService.deleteTask(taskId, userId);
    return res.status(200).json(result);
  })
);

//특정 할 일 가져오기 
router.get('/task/:taskId',requireAuth,asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;
    if(!userId){
      return res.redirect('/user/login');
    }
    const { taskId } = req.params;

    const task = await taskService.getOneTask(taskId, userId);
    return res.status(200).json(task);
  })
);

//전체 할 일 가져오기 
router.get('/',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;

    if(!userId){
      return res.redirect('/user/login');
    }

    const tasks = await taskService.getAllTasks(userId);
    return res.status(200).json(tasks);
  })
);

//할 일 수정
router.put('/update/:taskId',requireAuth, asyncWrapper(async (req, res) => {
    const userId = req.session.user.id;

    if(!userId){
      return res.redirect('/user/login');
    }

    const { taskId } = req.params;
    const content = req.body; 

    const updated = await taskService.updateTask(taskId, content, userId);
    return res.status(200).json(updated);
  })
);



module.exports = router;
