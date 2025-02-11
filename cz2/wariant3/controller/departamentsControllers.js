const dbHandler = require("./dbhandler");
const { isAuthenticated, isUserInDb } = require("./loginController");

const checkPermission = async (deptName, req, res) => {
    try {
        const isAuth = await isAuthenticated(req);
        console.log(isAuth, "gowno")
        if (!isAuth) {
            return res.redirect('/login');
        }

        if (isAuth.dept === "admin") {
            return isAuth;
        } else if (isAuth.dept === deptName) {
            return isAuth;
        }

        return res.render('noaccess', { session: req.auth });

    } catch (err) {
        console.error(err);
        return res.redirect('/login');
    }
};

const getAllUsers = async () => {
    await dbHandler.connect();
    const results = await dbHandler.search('users', {}, true);
    await dbHandler.close();

    return results
}

module.exports = { checkPermission, getAllUsers }