const router = require("express").Router();
const friendsController = require("../controllers/friends");
const tokenVerification = require("../middlewares/tokenVerification");

// POST:
router.post("/invite/:friendid", tokenVerification, friendsController.sendInvitation);
router.post("/accept/:invitationid", tokenVerification, friendsController.acceptInvitation);

module.exports = router;
