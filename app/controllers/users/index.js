const UserController = require("./UserController");

//POST:
module.exports.login = (req, res) => { new UserController(req, res).login() };
module.exports.register =  (req, res) => { new UserController(req, res).register() };
module.exports.forgotPassword = (req, res) => { new UserController(req, res).forgotPassword() };

//GET
module.exports.searchUser = (req, res) => { new UserController(req, res).searchUser() };

//PATCH:
module.exports.resetPassword = (req, res) => { new UserController(req, res).resetPassword() };
module.exports.editPassword = (req, res) => { new UserController(req, res).editPassword() };
