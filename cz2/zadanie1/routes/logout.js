const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          console.error('Nie udało się zniszczyć danych sesyjnych:', err);
          return res.status(500).send('Wystąpił błąd podczas wylogowywania');
        }else{
            res.redirect('/');
        }
    })
  
});

module.exports = router