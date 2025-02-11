const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));

const mongoURI = 'mongodb://localhost:27017'; // Adjust as needed
const client = new MongoClient(mongoURI);
const dbName = 'agh_app';
let db;


function generateOpaqueToken() {
  return crypto.randomBytes(32).toString('hex');
}

app.use("/login", (req, res, next ) => {
  const token = req.cookies['session_token'];

  if (token) {
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

    try {
      const usersCollection = db.collection('users');
  
      const user = await usersCollection.findOne({ username, password });
      if (!user) {
        return res.render('login', { error: 'Nieprawidłowe dane uzytkownika' });
      }
  
      const token = generateOpaqueToken();

      const expiresAt = new Date(Date.now() + 3600 * 1000);

      const sessionsCollection = db.collection('sessions');
      await sessionsCollection.insertOne({
        userId: user._id,
        token,
        username,
        expiresAt,
      });

      res.cookie('session_token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });
      return res.redirect('/informatics');
    } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred');
    }

  
 
});

app.get('/informatics', async (req, res) => {
  const token = req.cookies['session_token'];

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const sessionsCollection = db.collection('sessions');

    const session = await sessionsCollection.findOne({ token });
    if (!session || new Date() > session.expiresAt) {
      return res.status(401).json({ message: 'Unauthorized. Token is invalid or expired.' });
    }

    res.render('informatics');
    
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.get('/logout', async (req, res) => {
  const token = req.cookies['session_token'];
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  try {
    const sessionsCollection = db.collection('sessions');
    await sessionsCollection.deleteOne({ token });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
