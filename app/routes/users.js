const router = require("express").Router();
const usersController = require("../controllers/users")

// POST:
router.post("/login", usersController.login);
router.post("/register", usersController.register);

// PUT:
router.put("/forgot-password", usersController.forgotPassword);
router.put("/reset-password", usersController.resetPassword);

module.exports = router;