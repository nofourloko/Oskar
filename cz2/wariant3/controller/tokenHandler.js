const crypto = require('crypto')
const dbHandler = require('./dbhandler')

const addNewToken = async (data, token) => {
    await dbHandler.connect();
    const results = await dbHandler.insert('opaque_tokens', { token : token, username: data});
    await dbHandler.close();
}

const generateToken = async (data) => {
    const token = crypto.randomBytes(32).toString('hex');
    await addNewToken(data.username, token)
    return token
};

const isTokenIn = async (token) => {
    await dbHandler.connect();
    const results = await dbHandler.search('opaque_tokens', { token : token });
    await dbHandler.close();

    return results.username
};

const deleteToken = async (req) => {
    const token = req.cookies.token; 
    await dbHandler.connect();
    const results = await dbHandler.delete('opaque_tokens', { token : token });
    await dbHandler.close();
}


module.exports = { generateToken, isTokenIn, deleteToken}
