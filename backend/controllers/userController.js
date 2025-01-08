const express = require('express');
const router = express.Router();

const UserService = require('../services/userService');
const { pool } = require('../db');

// 에러 핸들러, 유틸 등 import
const CustomError = require('../utils/customError');
const asyncWrapper = require('../utils/asyncWrapper');

const userService = new UserService(pool);

router.post('/login', asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError('Email and password are required.', 400);
  }

  const user = await userService.login(email, password);
  req.session.user = user;
  res.status(200).json({ message: 'Logged in successfully.', user });
}));

router.post('/register', asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError('Email and password are required.', 400);
  }

  const user = await userService.register(email, password);
  res.status(201).json({ message: 'User registered successfully.', user });
}));

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(new CustomError('Failed to log out.', 500));
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});

module.exports = router;
