const UserController = require("./UserController");

// POST:
module.exports.login = (req, res) => { new UserController(req, res).login() };