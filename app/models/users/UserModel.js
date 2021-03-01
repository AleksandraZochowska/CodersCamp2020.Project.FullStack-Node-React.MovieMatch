const UserController = require("../../controllers/users/UserController");
const Model = require("../Model");
const userSchema = require("./userSchema");
const hashSchema = require("./hashSchema");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserModel extends Model {

    constructor() {
        super()
        this.User = mongoose.model("User", userSchema);
        this.Hash = mongoose.model("Hash", hashSchema);
        this.mongoURL = process.env.MONGO_URL;
        this.mongoDB = process.env.MONGO_DB;
    }
    
    findByEmail(email) {

        return new Promise((resolve, reject) => {

            this.connectToDB();

            this.User.findOne({email: email}, (err, user) => {
                this.disconnectFromDB();
                if (err) reject(err);
                resolve(user);
            });

        });
    }

    authorize(user, password) {

        return new Promise(async (resolve, reject) => {

            await this.connectToDB();

            this.Hash.findOne({userId: user._id}, (err, hash) => {
                this.disconnectFromDB();
                if (err) reject(err);
                console.log(hash.hash)
                bcrypt.compare(`${password}`, hash.hash, (authError, result) => {
                    if (authError) reject(authError);
                    if (result) {
                        const token = jwt.sign({userId: user._id}, `${process.env.SECRET_TOKEN}`, { expiresIn: "1h" });
                        resolve(token);
                    }
                    resolve(false);
                });

            });

        });
    }
}

module.exports = UserModel;