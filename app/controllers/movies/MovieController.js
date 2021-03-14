const Controller = require("../Controller");
const UserModel = require('../../models/users/UserModel');

class MovieController extends Controller {
    constructor(req, res) {
        super(req, res);
    }
    
    searchMovies() {}
}

module.exports = MovieController;
