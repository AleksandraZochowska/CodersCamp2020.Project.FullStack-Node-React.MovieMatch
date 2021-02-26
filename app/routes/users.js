const router = require("express").Router();
const usersController = require("../controllers/users")

// POST:
router.post("/login", usersController.login);
router.post("/register", usersController.register);