const express = require('express');
const dotenv = require('dotenv');
const app = express();
const { Pool } = require('pg');

//env set up
dotenv.config();

//database 
const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch((err) => {
        console.error('Error connecting to PostgreSQL:', err.stack);
        process.exit(1);
});

app.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); 
        res.json({ message: 'Database connected successfully', time: result.rows[0].now });
    } catch (err) {
        console.error('Database query error:', err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

//port set up
const PORT = process.env.PORT || 3000;

//basic route
app.get('/', (req, res) => {
    res.send('Hello, Node.js Server!');
});

//execute the server 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
