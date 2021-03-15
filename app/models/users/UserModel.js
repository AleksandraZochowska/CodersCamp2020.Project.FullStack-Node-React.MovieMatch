const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require("./userSchema");
const hashSchema = require("./hashSchema");

class UserModel {

    constructor() {
        this.User = mongoose.model("User", userSchema);
        this.Hash = mongoose.model("Hash", hashSchema);
        this.pseudoIdLength = 6;
        this.user;
    }
    
    addUser(name, email, displayedName) {

        return new Promise((resolve, reject) => {

            const user = new this.User({
                email: email,
                name: name,
                displayedName: displayedName + this.generatePseudoId(),
                friends: [],
                lastActivity: new Date(),
                active: false
            });
            user.save()
                .then((user) => {
                    resolve(user);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    addHash(userId, password) {

        return new Promise((resolve, reject) => {

            bcrypt.hash(password, 10, (err, hash) => {
                if(err) reject(err);

                const hashedEntry = new this.Hash({
                    userId: userId,
                    hash: hash
                });
                hashedEntry.save()
                    .then(() => resolve(userId))
                    .catch(err => reject(err));
            });
        });
    }

    findById(id) {

        return new Promise((resolve, reject) => {

            if(!mongoose.Types.ObjectId.isValid(id)) resolve("invalid");

            this.User.findById(id, (err, user) => {
                if(err) reject(err);
                this.user = user;
                resolve(user);
            });
        });
    }

     findAllUsers(email) {

        return new Promise((resolve, reject) => {

            this.User.find({}, (err, user) => {
                if (err) reject(err);
                resolve(user);
            });

        });
    }

    usersFilter(reqQuery) {

        return [
            {
                key: 'email',
                value: {
                    $regex: new RegExp(reqQuery.email),
                    $options: 'i',
                },
            },
            {
                key: 'displayedName',
                value: {
                    $regex: new RegExp(reqQuery.displayedName),
                    $options: 'i',
                },
            },
            {
                key: 'name',
                value: {
                    $regex: new RegExp(reqQuery.name),
                    $options: 'i',
                },
            }
        ]
    }

    searchUsersByFilter(usersFilterData, reqQuery) {

        const filteredData = [];

        usersFilterData.forEach( (filteredItem) => {
            if (reqQuery[filteredItem.key]) {
                filteredData.push(filteredItem.value);
            }
        });

        return filteredData;
    }

    findByFilter(key, reqEmail, filteredItemsList) {

        return new Promise((resolve, reject) => {

            if(key === 'email') {
                this.User.find({ email: filteredItemsList[0]['$regex']}, (err, user) => {
                    if (err) reject(err);
                    resolve(user); 
               });
            }

            if(key === 'displayedName') {
                this.User.find({ displayedName: filteredItemsList[0]['$regex']}, (err, user) => {
                    if (err) reject(err);
                    resolve(user); 
                });
            }
        });
    }

    paginationModel(qPage, qLimit, filteredList) {

        const page = parseInt(qPage);
        const limit = parseInt(qLimit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const resultUsers = {};

        resultUsers.next = {
            page: page + 1,
            limit: limit
        }

        resultUsers.previous = {
            page: page - 1,
            limit: limit
        }

        if (endIndex < filteredList.length) {
            resultUsers.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            resultUsers.previous = {
                page: page -1,
                limit: limit
            }
        }
        
        resultUsers.results = filteredList.slice(startIndex, endIndex);
        return resultUsers;
    }

    findByResetToken(token) {

        return new Promise((resolve, reject) => {

            this.User.findOne({"resetToken": `${token}`}, (err, user) => {
                if (err) reject(err);
                this.user = user;
                resolve(user);
            });
        });
    }

    removeUserById(id) {

        return new Promise((resolve, reject) => {

            this.User.findByIdAndDelete(id, (err, user) => {
                if (err) reject(err);
                resolve(user);
            });
        });
    }

    removeUserHashId(userId) {

        return new Promise((resolve, reject) => {

            this.Hash.findOneAndDelete({userId: userId}, (err, hash) => {
                if (err) reject(err);
                resolve(hash);
            });
        });
    }

    addToken(token) {
        
        return new Promise((resolve, reject) => {

            this.user.resetToken = token;
            this.user.save((err, savedDoc) => {
                if(err) reject(err);
                resolve(savedDoc);
            });
        });
    }

    changeHash(userId, newPassword) {

        return new Promise((resolve, reject) => {

            this.Hash.findOne({userId: userId}, (err, hash) => {
                if (err || !hash) reject(err);
                
                bcrypt.hash(newPassword, 10, (err, newHash) => {
                    if (err || !newHash) reject(err);
                    
                    hash.hash = newHash;
                    hash.save((err, savedDoc) => {
                        if(err) reject(err);
                        resolve(savedDoc);
                    });
                });
            });
        });
    }

    checkHash(userId, password) {

        return new Promise((resolve, reject) => {
            
            this.Hash.findOne({userId: userId}, (err, hash) => {
                if (err) reject(err);
                if (!hash) resolve(hash);
                
                bcrypt.compare(`${password}`, hash.hash, (compareError, result) => {
                    if(compareError) reject(compareError);
                    resolve(result);
                });
            });
        });
    }

    deleteResetToken(user) {
        
        return new Promise((resolve, reject) => {
            
            this.User.findOne({_id: user._id}, (err, user) => {
                if (err || !user) reject(err);
                
                user.resetToken = undefined;
                user.save((err, savedDoc) => {
                    if(err) reject(err);
                    resolve(savedDoc);
                });  
            });
        });
    }

    authorize(user, password) {
        
        return new Promise((resolve, reject) => {
            
            this.Hash.findOne({userId: user._id}, (err, hash) => {
                if (err) reject(err);
                
                bcrypt.compare(`${password}`, hash.hash, (authError, result) => {
                    if(authError) reject(authError);
                    if(!result) resolve(false);
                    const token = jwt.sign({userId: user._id}, `${process.env.PRIVATE_KEY}`, { expiresIn: "1h" });
                    if(token) resolve(token);
                });
            });
        });
    }

    changeUserName(userId, newName) {

        return new Promise((resolve, reject) => {

            this.User.findById(userId, (err, user) => {
                if(err) reject(err);
                if(!user) resolve(user);
                
                user.name = `${newName}`;
                user.save((err, savedDoc) => {
                    if(err) reject(err);
                    resolve(savedDoc);
                });
            });
        });
    }

    changeUserDisplayedName(userId, newDisplayedName) {
                    
        return new Promise((resolve, reject) => {

            this.User.findById(userId, (err, user) => {
                if(err) reject(err);
                if(!user) resolve(user);
                
                user.displayedName = `${newDisplayedName}#${user.displayedName.split('#')[1]}`;
                user.save((err, savedDoc) => {
                    if(err) reject(err);
                    resolve(savedDoc);
                });
            });
        });
    }

    changeUserEmail(userId, newEmail) {

        return new Promise((resolve, reject) => {

            this.User.findById(userId, (err, user) => {
                if(err) reject(err);
                if(!user) resolve(user);
                
                user.email = `${newEmail}`;
                user.save((err, savedDoc) => {
                    if(err) reject(err);
                    resolve(savedDoc);
                });
            });
        });
    }

    changeAvatar(userId, avatarHash) {

        return new Promise((resolve, reject) => {

            this.User.findById(userId, (err, user) => {
                if(err) reject(err);
                if(!user) resolve(null);

                user.avatar = avatarHash;
                user.save((err, savedDoc) => {
                    if (err) reject(err);
                    resolve(savedDoc);
                });
            });
        });
    }

    deleteUserAvatar(userId) {

        return new Promise((resolve, reject) => {

            this.User.findById(userId, (err, user) => {
                if(err) reject(err);
                if(!user) resolve(null);

                user.avatar = null;
                user.save((err, savedDoc) => {
                    if (err) reject(err);
                    resolve(savedDoc);
                });
            });
        });
    }

    changeActivation(userId, isActive) {

        return new Promise((resolve, reject) => {

            this.user.active = isActive;
            this.user.save((err, savedDoc) => {
                if(err) reject(err);
                resolve(savedDoc);

            });
        });
    }
  
    generatePseudoId() {
      return "#" + Math.floor(Math.random() * (10 ** this.pseudoIdLength - 1)).toString().padStart(this.pseudoIdLength,"0");
    }
}

module.exports = UserModel;