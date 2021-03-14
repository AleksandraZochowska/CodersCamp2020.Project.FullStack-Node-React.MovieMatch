const router = require("express").Router();
const friendsController = require("../controllers/friends");
const tokenVerification = require("../middlewares/tokenVerification");

// POST:
router.post("/invite/:friendid", tokenVerification, friendsController.sendInvitation);

module.exports = router;
