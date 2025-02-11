const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const path = require('path');
const USER = require('./credentials')

const app = express();
const PORT = 5000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'))
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

app.use("/login", async (req, res, next ) => {
  const isAuth = await isAuthenticated(req)
    if(isAuth){
        res.redirect("/informatics")
    }else{
        next()
    }
})

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).send('Authorization header is missing.');
  }

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':');

  if (username === USER.username && password === USER.password) {

  if (username === 'student' && password === 'agh123') {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    await redis.set(username, token, 'EX', 3600); 
    res.cookie('session_token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
    return res.redirect("/informatics")
  }
  }

  res.render('login', { error: 'Nieprawidłowe dane uzytkownika' });

 
});

app.get('/informatics', async (req, res) => {
  const isAuth = await isAuthenticated(req)

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
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
  
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
