const FriendController = require("./FriendController");

// POST:
module.exports.sendInvitation = (req, res) => { new FriendController(req, res).sendInvitation() };
