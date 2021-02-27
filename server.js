const dotenv = require("dotenv");
const routes = require("./app/routes");
const mongoose = require("mongoose");

const result = dotenv.config({ path: "./.env"});

class Server {
    constructor(express) {
        this.app = express;
        this.serverPort = process.env.SERVER_PORT || 4000;
        this.connectToDB();
        this.useMiddlewares();
        this.getRoutes();
        this.start();
    }

    connectToDB() {
        mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@awesomedb.lli4m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`);
    }

    useMiddlewares() {
        // app.use(zewnętrzny-middleware)
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