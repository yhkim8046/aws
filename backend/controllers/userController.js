const express = require('express');
const router = express.Router();

const UserService = require('../services/userService');
const { pool } = require('../db');
const CustomError = require('../utils/customError');
const asyncWrapper = require('../utils/asyncWrapper');

const userService = new UserService(pool);

// 로그인
router.post('/login', asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // 400 Bad Request
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  // 실제 로그인 로직
  const user = await userService.login(email, password);
  
  // 세션 저장
  req.session.user = user;
  
  // 기존: res.redirect('/dashboard');
  // 수정(예시): JSON 응답
  return res.status(200).json({
    message: '로그인 성공',
    user, // 필요하면 유저 정보 반환
  });
}));

// 회원가입
router.post('/register', asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = await userService.register(email, password);
  
  // 기존: res.redirect('/login');
  // 수정(예시): JSON 응답
  return res.status(201).json({
    message: '회원가입 성공',
    user,
  });
}));

// 로그아웃
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new CustomError('Failed to log out.', 500));
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: '로그아웃 완료' });
  });
});

module.exports = router;
