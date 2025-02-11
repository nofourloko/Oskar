const express = require('express');
const { deleteToken } = require('../controller/tokenHandler');
const router = express.Router()

router.get('/', async (req, res) => {
    await deleteToken(req)
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router