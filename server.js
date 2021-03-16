const dotenv = require("dotenv");
const routes = require("./app/routes");
const mongoose = require("mongoose");
const express = require("express");
const fileUpload = require("express-fileupload");

dotenv.config({ path: "./.env"});

class Server {
    
    constructor(dbConnectionString) {
        this.app = express();
        this.serverPort = process.env.PORT || 4000;
        this.dbConnectionString = dbConnectionString || process.env.DB_CONNECTION_STRING;
        this.connectToDB();
        this.useMiddlewares();
        this.getRoutes();
        this.start();
    }

    async connectToDB() {

        if(!this.dbConnectionString) throw new Error("Database connection string not defined");

        try {
            console.log(this.dbConnectionString)
            await mongoose.connect(`${this.dbConnectionString}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        } catch(error) {
            console.log(error); //TODO: better error handle function
            //try to connect again as when initial connection fails, mongoose will not attempt to reconnect
            console.log("Connection to database failed. Trying again...")
            this.connectToDB(); 
        }
    }

    useMiddlewares() {
        this.app.use(express.json());
        this.app.use(fileUpload());
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