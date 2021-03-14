const router = require("express").Router();
const moviesController = require("../controllers/movies");
const tokenVerification = require("../middlewares/tokenVerification");

// GET:
// router.get("/search", tokenVerification, moviesController.searchMovies);

// POST:
router.post("/:movieid", tokenVerification, moviesController.addMovieToLiked);

// PATCH:
router.patch("/:movieid", tokenVerification, moviesController.toggleWatched);

// DELETE:
router.delete("/:movieid", tokenVerification, moviesController.deleteMovieFromLiked);

module.exports = router;
