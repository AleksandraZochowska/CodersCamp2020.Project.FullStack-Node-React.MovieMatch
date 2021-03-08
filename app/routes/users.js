const router = require("express").Router();
const usersController = require("../controllers/users");
const tokenVerification = require("../middlewares/tokenVerification");

// POST:
router.post("/login", usersController.login);
router.post("/register", usersController.register);
router.post("/forgotpassword", usersController.forgotPassword);

// GET
router.get("/searchuser", usersController.searchUser);

// PATCH:
router.patch("/resetpassword", usersController.resetPassword);
router.patch("/profile/edit/editpassword", tokenVerification, usersController.editPassword);
router.patch("/profile/edit/editdata", tokenVerification, usersController.editUserData);

// DELETE:
router.delete("/profile/edit/deleteuser", tokenVerification, usersController.deleteUser);

module.exports = router;