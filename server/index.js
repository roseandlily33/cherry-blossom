const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const app = express();
const port = 3005;

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_EXPRESS, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
  }));

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

app.get('/', (req, res) => {
// Keeps track of how many times a user has checked this route
  req.session.views = (req.session.views || 0) + 1;
  res.cookie('exampleCookie', 'cookieValue', { maxAge: 900000, httpOnly: true });
  res.send('Hello World!');
});

app.get('/data', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM your_table');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

// Route to read cookies
app.get('/read-cookie', (req, res) => {
    // Read a cookie
    const exampleCookie = req.cookies.exampleCookie;
    res.send(`Cookie value: ${exampleCookie}`);
  });
  

// Start the server
app.listen(port, () => {
  pool.connect((err) => {
    if (err) {
      console.error('Error connecting to the database', err);
    } else {
      console.log('Connected to the PostgreSQL database');
    }
  });
  console.log(`Server is running on http://localhost:${port}`);
});