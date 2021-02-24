const dotenv = require("dotenv");

dotenv.config({ path: "./env"});

class Server {
    constructor(express) {
        this.app = express;
        this.useMiddlewares();
        this.getRoutes();
        this.start();
    }

    useMiddlewares() {}

    getRoutes() {}

    start() {}
}

module.exports = Server;