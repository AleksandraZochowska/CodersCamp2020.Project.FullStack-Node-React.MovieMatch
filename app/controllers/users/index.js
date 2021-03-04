const UserController = require("./UserController");

// POST:
module.exports.login = (req, res) => { new UserController(req, res).login() };
module.exports.register =  (req, res) => { new UserController(req, res).register() };
module.exports.forgotPassword = (req, res) => { new UserController(req, res).forgotPassword() };

//PATCH:
module.exports.resetPassword = (req, res) => { new UserController(req, res).resetPassword() };
