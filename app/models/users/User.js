const UserController = require("../../controllers/users/UserController");
const mongoose = require("mongoose");


class User {
    //get user po konkretnym id z database
    //get users po zadanych warunkach z database
    //autoryzacja
    //wyszukiwanie w bazie po id, emailu, itd.
    //updateowanie usera
    constructor() {
        this.model = mongoose.model('User', userSchema);
    }
}

module.exports = User;

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: { 
        type: String, 
        require: true,
        lowercase: true,
        trim: true,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password: {
        type: String,
        require: true,
        minlength: 8,
        maxlength: 24,
        trim: true
    },
    name: {
        type: String,
        maxlength: 24,
        trim: true
    },
    nick: {
        type: String,
        maxlength: 16,
        trim: true
    },
    registrationDate: {
        type: Date
    },
    lastModificationDate: {
        type: Date
    }
})
