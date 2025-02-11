const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.render('index', {session : req.auth});
  });

module.exports = router