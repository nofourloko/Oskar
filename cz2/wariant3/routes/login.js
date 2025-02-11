const express = require('express')
const { isAuthenticated, isUserInDb, hashPassword, addNewUserToDb, comparePasswords, loginTokenHandler } = require('../controller/loginController')
const USER = require('../Model/credentials')
const { generateToken } = require('../controller/tokenHandler')
const router = express.Router()

router.use("/",  async (req, res, next ) => {
    const userIn = await isAuthenticated(req)
    if(userIn){
        return res.redirect(`/departaments/${userIn.dept}`);
    }else{
        next()
    }
})

router.get('/', (req, res) => {
    res.render('login', { error: null, session : req.auth });
  });


router.post('/', async (req, res) => {
  const { username, password } = req.body
  const user = new USER(username, password)
  const isUserRegistered = await isUserInDb(user.username)
    
  if (isUserRegistered) {
    const comparedPassword = await comparePasswords(password, isUserRegistered.password)

    if(comparedPassword){
        const token = await generateToken(isUserRegistered)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 10 * 60 * 1000,
        });
        
        return res.redirect(`/departaments/${isUserRegistered.dept}`);
    }

  }

  res.render('login', { error: 'Nieprawidłowe dane uzytkownika', session : req.auth });
});

router.get("/register", (req, res) => {
    res.render('register', { error: null, session : req.auth});
})

router.post("/register", async (req, res) => {
    try {
        const newUser = req.body;

        if (!newUser) {
            return res.render('register', { error: "Wystąpił błąd: Brak danych wejściowych.", session : req.auth });
        }

        const newPassword = await hashPassword(newUser.password);
        newUser.password = newPassword
        const addUser = await addNewUserToDb(newUser);

        if (!addUser) {
            return res.render('register', { error: "Wystąpił błąd podczas dodawania użytkownika do bazy danych." , session : req.auth});
        }

        const token = await generateToken(newUser)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            maxAge: 10 * 60 * 1000,
        });
        
        return res.render(`${newUser.dept}`, {user : newUser, session : req.auth});

    } catch (error) {
        console.error("Błąd rejestracji:", error);
        return res.render('register', { error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie." , session : req.auth});
    }
});


module.exports = router