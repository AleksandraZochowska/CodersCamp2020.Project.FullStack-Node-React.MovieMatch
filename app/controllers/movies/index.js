const MovieController = require("./MovieController");

// GET:
module.exports.searchMovies = (req, res) => { new MovieController(req, res).searchMovies() };

// POST:
module.exports.addMovieToLiked = (req, res) => { new MovieController(req, res).addMovieToLiked() };

// PATCH:
module.exports.toggleWatched = (req, res) => { new MovieController(req, res).toggleWatched() };

// DELETE:
module.exports.deleteMovieFromLiked = (req, res) => { new MovieController(req, res).deleteMovieFromLiked() };
