const UserController = require("../../controllers/users/UserController");
const mongoose = require("mongoose");
const { connect } = require("../../routes/users");
const bcrypt = require("bcrypt");


class HashModel {
    constructor() {
        this.model = mongoose.model('Hash', hashSchema);
    }

    addHash(userId, password) {
        bcrypt.hash(password, 10, (err, hashedPw) => {
            if(err) {
                throw new Error;
            }
            const hash = new this.model({
                _id: new mongoose.Types.ObjectId(),
                userId: userId,
                hash: hashedPw,
                updatedAt: new Date()
            });
            hash.save();
        })
    }
}

const hashSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    hash: String,
    updatedAt: Date,
})

module.exports = HashModel;
