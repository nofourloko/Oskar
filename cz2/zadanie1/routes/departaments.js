const express = require('express');
const { checkPermission, getAllUsers }= require('../controller/departamentsControllers');
const router = express.Router()

router.get('/informatyka', async (req, res) => {
    const userData = await checkPermission("informatyka", req, res)
    if(userData){
        res.render("informatyka", {user : userData, session : req.auth});
    }
});
router.get('/admin', async (req, res) => {
    const userData = await checkPermission("admin", req, res)
    const allUsers = await getAllUsers()
    console.log(allUsers)
    res.render("admin", {users: allUsers, session : req.auth});
});
router.get('/elektronika', async (req, res) => {
    
    const userData = await checkPermission("elektronika", req, res)
    if(userData){
        res.render("elektronika", {user : userData, session : req.auth});
    }
    
})
router.get('/bioinformatyka', async (req, res) => {
    const userData = await checkPermission("bioinformatyka", req, res)
    res.render("bioinformatyka", {user : userData, session : req.auth});
})
module.exports = router