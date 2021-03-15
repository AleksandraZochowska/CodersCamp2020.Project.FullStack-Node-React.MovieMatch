const FriendController = require("./FriendController");

// GET:
module.exports.showFriendsProfile = (req, res) => { new FriendController(req, res).showFriendsProfile() };

// POST:
module.exports.sendInvitation = (req, res) => { new FriendController(req, res).sendInvitation() };
module.exports.acceptInvitation = (req, res) => { new FriendController(req, res).acceptInvitation() };
module.exports.declineInvitation = (req, res) => { new FriendController(req, res).declineInvitation() };
