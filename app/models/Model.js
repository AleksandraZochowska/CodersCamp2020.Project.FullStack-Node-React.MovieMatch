const mongoose = require('mongoose');

class Model {

    constructor() {}

    async connectToDB() {
        if(process.env.DB_USER && process.env.DB_PASSWD) {
            const connectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@awesomedb.lli4m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
            await mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
            console.log("Connected to db")
        } else {
            throw new Error("DB_USER and/or DB_PASSWD not defined");
        }
    }

    disconnectFromDB() {
        mongoose.disconnect(() => {
            console.log("Disconnected from db");
        });
    }
}

module.exports = Model;