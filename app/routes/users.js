const router = require("express").Router();
const usersController = require("../controllers/users");
const tokenVerification = require("../middlewares/tokenVerification");

// POST:
router.post("/login", usersController.login);
router.post("/register", usersController.register);
router.post("/forgotpassword", usersController.forgotPassword);
router.post("/avatar", tokenVerification, usersController.setAvatar);

// GET
router.get("/avatar/:userId", usersController.getAvatar);
router.get("/", tokenVerification, usersController.searchUser);


// PATCH:
router.patch("/:id/password", tokenVerification, usersController.editPassword);
router.patch("/:id", tokenVerification, usersController.editUserData);

// PUT:
router.put("/resetpassword/:resettoken", usersController.resetPassword);
router.put("/register/:registrationtoken", usersController.confirmRegistration);

// DELETE:
router.delete("/:id", tokenVerification, usersController.deleteUser);

module.exports = router;
