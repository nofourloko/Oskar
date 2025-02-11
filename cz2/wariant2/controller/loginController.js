const dbHandler = require('./dbhandler');
const bcrypt = require('bcrypt');
const { generateToken, isTokenIn } = require('./tokenHandler');
const jwt = require('jsonwebtoken')


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
function isAuthenticated(req) {
    const token = req.cookies.token; 
    if (!token) {
        return false;
    }
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        return decoded;
    } catch (err) {
        return false;
    }
}

module.exports = {isAuthenticated, isUserInDb, addNewUserToDb, hashPassword, comparePasswords}
