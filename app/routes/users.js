const router = require("express").Router();
const usersController = require("../controllers/users")
const tokenVerification = require("../middlewares/tokenVerification")

// POST:
router.post("/login", usersController.login);
router.post("/register", usersController.register);
router.post("/forgotpassword", usersController.forgotPassword);

//PATCH:
router.patch("/resetpassword", usersController.resetPassword);
router.patch("/profile/edit/editpassword", tokenVerification, usersController.editPassword);

module.exports = router;