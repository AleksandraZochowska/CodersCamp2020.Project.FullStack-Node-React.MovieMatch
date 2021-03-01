const router = require("express").Router();
const usersController = require("../controllers/users")

// POST:
router.post("/login", usersController.login);

module.exports = router;