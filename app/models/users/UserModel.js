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
        this.user;
    }
    
    addUser(name, email, password, displayedName) {

        return new Promise(async (resolve, reject) => {

            await this.connectToDB();
       
            const userId = new mongoose.Types.ObjectId();
            const creationDate = new Date();

            this.addHash(userId, password, creationDate);
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
            user.save()
                .then(() => {
                    this.disconnectFromDB();
                    resolve(userId)
                })
                .catch((err) => {
                    this.disconnectFromDB();
                    reject(err)
                });
        });
    }

    addHash(userId, password, date) {

        bcrypt.hash(password, 10, (err, hash) => {
            if(err) {
                throw new Error;
            }
            const hashedEntry = new this.Hash({
                _id: new mongoose.Types.ObjectId(),
                userId: userId,
                hash: hash,
                updatedAt: date
            });
            hashedEntry.save();
        });
    }
  
    findByEmail(email) {

        return new Promise(async (resolve, reject) => {

            await this.connectToDB();

            this.User.findOne({email: email}, (err, user) => {
                // this.disconnectFromDB();
                if (err) reject(err);
                this.user = user;
                resolve(user);
            });

        });
    }

    findByResetToken(token) {

        return new Promise(async (resolve, reject) => {

            await this.connectToDB();

            this.User.findOne({"resetToken": `${token}`}, (err, user) => {
                this.disconnectFromDB();
                if (err) reject(err);
                resolve(user);
            });

        });
    }

    addToken(token) {
        
        return new Promise(async (resolve, reject) => {

            // await this.connectToDB();
            this.user.resetToken = token;
            this.user.save((err, savedDoc) => {
                if(err) reject(err);
                // this.disconnectFromDB();
                resolve(savedDoc);
            });

        });
    }

    changeHash(user, newPassword) {

        return new Promise(async (resolve, reject) => {

            await this.connectToDB();

            this.Hash.findOne({userId: user._id}, (err, hash) => {
                if (err || !hash) reject(err);
                
                bcrypt.hash(newPassword, 10, (err, newHash) => {
                    if (err || !newHash) reject(err);
                    
                    hash.hash = newHash;
                    hash.save((err, savedDoc) => {
                        if(err) reject(err);
                        // this.disconnectFromDB();
                        resolve(savedDoc);
                    });
                });
            });
        });
    }

    deleteResetToken(user) {
        
        return new Promise(async (resolve, reject) => {
            
            await this.connectToDB();

            this.User.findOne({_id: user._id}, (err, user) => {
                if (err || !user) reject(err);
                
                user.resetToken = "";
                user.save((err, savedDoc) => {
                    if(err) reject(err);
                    // this.disconnectFromDB();
                    resolve(savedDoc);
                });
                
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
                        const token = jwt.sign({userId: user._id}, `${process.env.PRIVATE_KEY}`, { expiresIn: "1h" });
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