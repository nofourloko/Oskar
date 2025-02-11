const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const loginRouter = require('./routes/login')
const departamentsRouter = require('./routes/departaments')
const guestRouter = require('./routes/guest')
const logoutRouter = require('./routes/logout');
const { isAuthenticated } = require('./controller/loginController');

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
        secret: "agh_secret_key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 10 * 60 * 1000,
            httpOnly: true,
            secure: false, 
        },
    })
);

app.use("*", ( req ,res, next ) => {
  const isAuth = isAuthenticated(req)
  req.auth = isAuth
  next()
})

app.use("/login", loginRouter)
app.use('/departaments', departamentsRouter)
app.use('/', guestRouter)
app.use('/logout', logoutRouter)

// app.get("*", (req, res) => {
//   res.render("404.ejs", {session: req.auth})
// })
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
