const users = require("./users");
const friends = require("./friends");

module.exports = (app) => {

    app.use("/api/users", users);
    app.use("/api/friends", friends);

}