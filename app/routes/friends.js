const router = require("express").Router();
const friendsController = require("../controllers/friends");
const tokenVerification = require("../middlewares/tokenVerification");

// GET:
router.get("/:friendid", tokenVerification, friendsController.showFriendsProfile);
router.get("/", tokenVerification, friendsController.showFriends);

// POST:
router.post("/invite/:friendid", tokenVerification, friendsController.sendInvitation);
router.post("/accept/:invitationid", tokenVerification, friendsController.acceptInvitation);
router.post("/decline/:invitationid", tokenVerification, friendsController.declineInvitation);

module.exports = router;
