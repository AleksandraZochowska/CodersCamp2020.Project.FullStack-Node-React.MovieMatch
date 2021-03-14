const FriendController = require("./FriendController");

// POST:
module.exports.sendInvitation = (req, res) => { new FriendController(req, res).sendInvitation() };
module.exports.acceptInvitation = (req, res) => { new FriendController(req, res).acceptInvitation() };
module.exports.declineInvitation = (req, res) => { new FriendController(req, res).declineInvitation() };
