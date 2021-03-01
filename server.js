const express = require("express");
const dotenv = require("dotenv");
const routes = require("./app/routes");

dotenv.config({ path: "./.env"});

class Server {
    
    constructor() {
        this.app = express();
        this.serverPort = process.env.SERVER_PORT || 4000;
        this.useMiddlewares();
        this.getRoutes();
        this.start();
    }

    useMiddlewares() {
        this.app.use(express.json());
    }

    getRoutes() {
        routes(this.app);
    }

    start() {
        this.app.listen(this.serverPort, () => {
            console.log("MovieMatch listens on port " + this.serverPort);
        });
    }
}

module.exports = Server;