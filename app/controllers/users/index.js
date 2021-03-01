const UserController = require("./UserController");

// POST:
module.exports.login = (req, res) => { new UserController(req, res).login() };
module.exports.register =  (req, res) => { new UserController(req, res).register() };