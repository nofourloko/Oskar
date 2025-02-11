const dbHandler = require("./dbhandler");
const { isAuthenticated, isUserInDb } = require("./loginController");

const checkPermission = async (deptName, req, res) => {
    const isAuth = isAuthenticated(req)
  
    if (!isAuth) {
        return res.redirect('/login');
    }
    const user = await isUserInDb(isAuth)
    if(user.dept === "admin"){
        return user
    }
    else if(user.dept === deptName){

        return user
    }
    return res.render('noaccess', {session : req.auth})
}
const getAllUsers = async () => {
    await dbHandler.connect();
    const results = await dbHandler.search('users', {}, true);
    await dbHandler.close();

    return results
}

module.exports = { checkPermission, getAllUsers }