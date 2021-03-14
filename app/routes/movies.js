const router = require("express").Router();
const moviesController = require("../controllers/movies");
const tokenVerification = require("../middlewares/tokenVerification");

// GET:
router.get("/search", tokenVerification, moviesController.searchMovies);

module.exports = router;
