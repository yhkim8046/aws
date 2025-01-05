const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const UserService = require('../services/userService');

require('dotenv').config();

// MySQL Connection Pool 설정
const pool = mysql.createPool({
    host: '127.0.0.1',
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

// UserService 초기화
const userService = new UserService(pool);

// login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await userService.login(email, password, req);        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /login:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const newUser = await userService.register(email, password);
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error in /register:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// logout
router.post('/logout', async (req, res) => {
    try {
        const result = await userService.logout(req);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in /logout:', error.message);
        res.status(400).json({ error: error.message });
    }
});

//Session test 
router.get('/session', (req, res) => {
    res.json(req.session);
});


module.exports = router;
