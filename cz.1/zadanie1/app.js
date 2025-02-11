const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const USER = require('./Model/credentials')

const app = express();
const PORT = 5000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
      secret: 'agh_secret_key',
      resave: false,
      saveUninitialized: false,
    })
  );

function isAuthenticated(req) {
    if(req.session.user){
        return req.session.user 
    }else{
        return false
    }
}

app.use("/login", (req, res, next ) => {
    if(req.session.user){
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

app.post('/login', (req, res) => {

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).send('Authorization header is missing.');
  }

  const [username, password] = Buffer.from(authHeader.split(' ')[1], 'base64')
    .toString()
    .split(':');

  if (username === USER.username && password === USER.password) {

    req.session.user = username
    return res.redirect('/informatics');
  }

  res.render('login', { error: 'Nieprawidłowe dane uzytkownika' });

 
});

app.get('/informatics', (req, res) => {
  const isAuth = isAuthenticated(req)

  if (!isAuth) {
    return res.redirect('/login');
  }
  res.render('informatics', {user : isAuth});
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          console.error('Nie udało się zniszczyć danych sesyjnych:', err);
          return res.status(500).send('Wystąpił błąd podczas wylogowywania');
        }else{
            res.redirect('/');
        }
    })
  
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
