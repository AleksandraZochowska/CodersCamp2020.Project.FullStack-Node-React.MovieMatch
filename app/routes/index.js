const users = require("./users");
const friends = require("./friends");
const movies = require("./movies");

module.exports = (app) => {

    app.use("/api/users", users);
    app.use("/api/friends", friends);
    app.use("/api/movies", movies);

}