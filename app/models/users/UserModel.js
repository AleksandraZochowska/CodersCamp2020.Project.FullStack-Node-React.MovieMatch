const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Model = require("../Model");
const userSchema = require("./userSchema");
const hashSchema = require("./hashSchema");

class UserModel extends Model {

    constructor() {
        super()
        this.User = mongoose.model("User", userSchema);
        this.Hash = mongoose.model("Hash", hashSchema);
        this.mongoURL = process.env.MONGO_URL;
        this.mongoDB = process.env.MONGO_DB;
        this.pseudoIdLength = 6;
    }
    
    addUser(name, email, displayedName) {

        return new Promise(async (resolve, reject) => {

            const user = new this.User({
                email: email,
                name: name,
                displayedName: displayedName + this.generatePseudoId(),
                friends: [],
                lastActivity: new Date()
            });
            user.save()
                .then((user) => {
                    resolve(user);
                })
                .catch((err) => {
                    reject(err);
                });
            })
    }

    addHash(userId, password) {

        return new Promise(async (resolve, reject) => {

            bcrypt.hash(password, 10, (err, hash) => {
                if(err) {
                    reject(err);
                }
                const hashedEntry = new this.Hash({
                    userId: userId,
                    hash: hash
                });
                hashedEntry.save()
                    .then(resolve(userId))
                    .catch(err => reject(err));
            });
        });
    }

    findById(id) {

        return new Promise(async (resolve, reject) => {

            this.User.findById(id, (err, user) => {
                if(err) reject(err);
                resolve(user);
            });
        });
    }
  
    findByEmail(email) {

        return new Promise(async (resolve, reject) => {

            this.User.findOne({email: email}, (err, user) => {
                if (err) reject(err);
                resolve(user);
            });
        });
    }

    removeById(id) {

        return new Promise(async (resolve, reject) => {

            this.User.findByIdAndDelete(id, (err, user) => {
                if (err) reject(err);
                resolve(user);
            });
        });
    }

    authorize(user, password) {

        return new Promise(async (resolve, reject) => {

            this.Hash.findOne({userId: user._id}, (err, hash) => {
                if (err) reject(err);
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
      return "#" + Math.floor(Math.random() * (10 ** this.pseudoIdLength - 1)).toString().padStart(this.pseudoIdLength,"0");
    }

}

module.exports = UserModel;