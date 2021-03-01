const express = require("express");
const dotenv = require("dotenv");
const routes = require("./app/routes");
const mongoose = require("mongoose");
const express = require("express");

dotenv.config({ path: "./.env"});

class Server {
    
    constructor() {
        this.app = express();
        this.serverPort = process.env.SERVER_PORT || 4000;
        this.connectToDB();
        this.useMiddlewares();
        this.getRoutes();
        this.start();
    }

    connectToDB() {
        if(process.env.DB_USER && process.env.DB_PASSWD) {
            const connectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@awesomedb.lli4m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
            mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        } else {
            throw new Error("DB_USER and/or DB_PASSWD not defined");
        }
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