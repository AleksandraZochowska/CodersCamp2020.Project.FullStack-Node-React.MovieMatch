const router = require("express").Router();
const usersController = require("../controllers/users")

// POST:
router.post("/login", usersController.login);
router.post("/register", usersController.register);

// PUT:
router.post("/forgotpassword", usersController.forgotPassword);

//PATCH:
router.patch("/resetpassword", usersController.resetPassword);

module.exports = router;