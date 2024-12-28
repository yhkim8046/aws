const express = require('express');
const dotenv = require('dotenv');
const app = express();
const { Pool } = require('pg');
const UserService = require('./services/userService');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

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

//port set up
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.json());

// Session setup
app.use(
    session({
      store: new pgSession({
        pool, // PostgreSQL pool connection
        tableName: 'session', // Default table name
      }),
      secret: process.env.SESSION_SECRET, // Replace with a secure secret
      resave: false, // Don't save session if unmodified
      saveUninitialized: false, // Don't save uninitialized session
      cookie: {
        httpOnly: true, // Protect against XSS
        secure: false, // Set true for HTTPS
        maxAge: 1000 * 60 * 15, // Session expires in 15 minutes
      },
    })
);

//basic route
app.get('/', (req, res) => {
    res.send('Hello, Node.js Server!');
});

//execute the server 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


