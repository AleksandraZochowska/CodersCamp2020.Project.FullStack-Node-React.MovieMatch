const router = require("express").Router();
const usersController = require("../controllers/users");
const tokenVerification = require("../middlewares/tokenVerification");

// POST:
router.post("/login", usersController.login);
router.post("/register", usersController.register);
router.post("/forgotpassword", usersController.forgotPassword);

// GET
router.get("/", usersController.searchUser);

// PATCH:
router.patch("/profile/edit/editpassword", tokenVerification, usersController.editPassword);
router.patch("/profile/edit/editdata", tokenVerification, usersController.editUserData);

// PUT:
router.put("/resetpassword/:resettoken", usersController.resetPassword);
router.put("/register/:registrationtoken", usersController.confirmRegistration);

// DELETE:
router.delete("/profile/edit/deleteuser", tokenVerification, usersController.deleteUser);

module.exports = router;