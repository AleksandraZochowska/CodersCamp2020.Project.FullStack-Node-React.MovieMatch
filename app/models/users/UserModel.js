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
    
    addUser(name, email, password, displayedName) {

        return new Promise(async (resolve, reject) => {

            await this.connectToDB();
       
            const userId = new mongoose.Types.ObjectId();

            const user = new this.User({
                _id: userId,
                email: email,
                name: name,
                displayedName: displayedName + this.generatePseudoId(),
                friends: [],
                lastActivity: new Date()
            });
            user.save()
                .then(() => {
                    this.addHash(userId, password)
                        .then(() => {
                            this.disconnectFromDB();
                            resolve(userId);
                        })
                        .catch((err) => {
                            this.disconnectFromDB();
                            reject(err);
                        });
                })
                .catch((err) => {
                    this.disconnectFromDB();
                    reject(err);
                });
        });
    }

    addHash(userId, password) {

        return new Promise(async (resolve, reject) => {

            bcrypt.hash(password, 10, (err, hash) => {
                if(err) {
                    reject(err);
                }
                const hashedEntry = new this.Hash({
                    _id: new mongoose.Types.ObjectId(),
                    userId: userId,
                    hash: hash
                });
                hashedEntry.save()
                    .then(resolve(userId))
                    .catch(err => reject(err));
            });
        })
    }
  
    findByEmail(email) {

        return new Promise(async (resolve, reject) => {

            await this.connectToDB();

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