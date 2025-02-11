const express = require('express');
const { checkPermission, getAllUsers }= require('../controller/departamentsControllers');
const router = express.Router()

router.get('/informatyka', async (req, res) => {
    try {
        const userData = await checkPermission("informatyka", req, res);
        if (userData) {
            return res.render("informatyka", { user: userData, session: req.auth });
        }
    } catch (err) {
        console.error(err);
        return res.redirect('/login'); // In case of any error, redirect to login
    }
});

router.get('/admin', async (req, res) => {
    try {
        const userData = await checkPermission("admin", req, res);
        if (userData) {
            const allUsers = await getAllUsers();
            console.log(allUsers);
            return res.render("admin", { users: allUsers, session: req.auth });
        }
    } catch (err) {
        console.error(err);
        return res.redirect('/login');
    }
});

router.get('/elektronika', async (req, res) => {
    try {
        const userData = await checkPermission("elektronika", req, res);
        if (userData) {
            return res.render("elektronika", { user: userData, session: req.auth });
        }
    } catch (err) {
        console.error(err);
        return res.redirect('/login');
    }
});

router.get('/bioinformatyka', async (req, res) => {
    try {
        const userData = await checkPermission("bioinformatyka", req, res);
        if (userData) {
            return res.render("bioinformatyka", { user: userData, session: req.auth });
        }
    } catch (err) {
        console.error(err);
        return res.redirect('/login');
    }
});

module.exports = router