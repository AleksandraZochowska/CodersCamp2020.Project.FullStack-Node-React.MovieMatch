const users = require("./users");

module.exports = (app) => {

    app.use("/api/users", users);
    
    // ... dla innych url odwołamy się do innych ścieżek

}