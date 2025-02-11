const dbHandler = require('./dbhandler');
const bcrypt = require('bcrypt');
const { generateToken, isTokenIn } = require('./tokenHandler');


const hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (err) {
        console.error("Error hashing password:", err);
        throw err;
    }
};

const comparePasswords = async (enteredPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(enteredPassword, hashedPassword);
    } catch (error) {
        console.error("Błąd porównywania haseł:", error);
        throw error; 
    }
};

const isUserInDb = async (name) => {
    await dbHandler.connect();
    const results = await dbHandler.search('users', { username: name });
    await dbHandler.close();

    return results
};

const addNewUserToDb = async (newUser) => {
    await dbHandler.connect()
    const result = await dbHandler.insert('users', newUser)
    await dbHandler.close()

    return result
}

async function isAuthenticated(req) {
    const token = req.cookies.token; 
    console.log(token)
    if (!token) {
        return false;
    }
  
    const isTokenExits = await isTokenIn(token)
    if(isTokenExits){
        const user = await isUserInDb(isTokenExits)
        return user
    }else{
        return false
    }
}

const loginTokenHandler = async (data, res) => {
    const token = await generateToken(data)

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 10 * 60 * 1000,
    });
}

module.exports = {isAuthenticated, isUserInDb, addNewUserToDb, hashPassword, comparePasswords, loginTokenHandler }
