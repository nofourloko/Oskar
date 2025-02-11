const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const path = require('path');
const USER = require('./credentials');

const app = express();
const PORT = 5000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

const JWT_SECRET = 'agh_secret_key';
const redis = new Redis();

async function isAuthenticated(req) {
  const token = req.cookies['session_token']; 
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const storedToken = await redis.get(decoded.username);
    return storedToken === token;
  } catch (err) {
    return false;
  }
}

app.use("/login", async (req, res, next) => {
  const isAuth = await isAuthenticated(req);
  if (isAuth) {
    res.redirect("/informatics");
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    try {
      await redis.set(username, token, 'EX', 3600);
      res.cookie('session_token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
      return res.redirect("/informatics");
    } catch (err) {
      console.error('Error storing token in Redis:', err);
      res.render('login', { error: 'Wystąpił błąd podczas logowania. Spróbuj ponownie później.' });
    }
  } else {
    res.render('login', { error: 'Nieprawidłowe dane użytkownika' });
  }
});

app.get('/informatics', async (req, res) => {
  const isAuth = await isAuthenticated(req);
  if (!isAuth) {
    return res.redirect('/login');
  }
  res.render('informatics');
});

app.get('/logout', async (req, res) => {
  const token = req.cookies['session_token'];
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await redis.del(decoded.username);
    res.clearCookie('session_token');
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
