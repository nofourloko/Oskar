const jwt = require('jsonwebtoken')
const generateToken = (user) => {
    const payload = {
        username: user.username,
        dept: user.dept
    };
    
    const options = {
        expiresIn: '10m',
    };

    return jwt.sign(payload, process.env.JWT_SECRET_KEY, options);
};

module.exports = { generateToken}
