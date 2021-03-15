const dotenv = require("dotenv");
const routes = require("./app/routes");
const mongoose = require("mongoose");
const express = require("express");
const fileUpload = require("express-fileupload");

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

    async connectToDB() {

        if(!process.env.DB_USER || !process.env.DB_PASSWD) throw new Error("DB_USER and/or DB_PASSWD not defined");

        const connectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@awesomedb.lli4m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

        try {
            await mongoose.connect(connectionString, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
        } catch(error) {
            console.log(error); //TODO: better error handle function
            //try to connect again as when initial connection fails, mongoose will not attempt to reconnect
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