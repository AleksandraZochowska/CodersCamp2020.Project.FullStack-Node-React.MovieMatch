const Model = require("../Model");
const userSchema = require("./userSchema");
const hashSchema = require("./hashSchema");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const HashModel = require("./HashModel");
const hashModel = new HashModel();

class UserModel extends Model {

    constructor() {
        super()
        this.User = mongoose.model("User", userSchema);
        this.Hash = mongoose.model("Hash", hashSchema);
        this.mongoURL = process.env.MONGO_URL;
        this.mongoDB = process.env.MONGO_DB;
    }
    
    addUser(name, email, password, displayedName) {

        const creationDate = new Date();       
        const userId = new mongoose.Types.ObjectId();

        hashModel.addHash(userId, password, creationDate);
        const user = new this.User({
            _id: userId,
            email: email,
            name: name,
            displayedName: displayedName + this.generatePseudoId(),
            friends: [],
            createdAt: creationDate,
            updatedAt: creationDate,
            lastActivity: creationDate
        });
        user.save();

        return userId;
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
  
    generatePseudoId() {
      const pseudoIdLength = 6;
      return "#" + Math.floor(Math.random() * (10 ** pseudoIdLength - 1)).toString().padStart(pseudoIdLength,"0");
    }

}

module.exports = UserModel;
