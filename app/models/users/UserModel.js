const UserController = require("../../controllers/users/UserController");
const mongoose = require("mongoose");
const HashModel = require("./HashModel");
const hashModel = new HashModel();

class UserModel {
    //get user po konkretnym id z database
    //get users po zadanych warunkach z database
    //autoryzacja
    //wyszukiwanie w bazie po id, emailu, itd.
    //updateowanie usera
    constructor() {
        this.model = mongoose.model('User', userSchema);
    }

    addUser(name, email, password, displayedName) {
        const creationDate = new Date();       
        const userId = new mongoose.Types.ObjectId();

        const user = new this.model({
            _id: userId,
            email: email,
            name: name,
            displayedName: displayedName,
            friends: [],
            createdAt: creationDate,
            updatedAt: creationDate,
            lastActivity: creationDate
        });
        user.save();
        hashModel.addHash(userId, password);
    }

    findByEmail(email) {
        this.model.find({email: email})
        .exec()
        .then(user => {
            return user;
        })
        .catch(err => console.log(err))
    }
}

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
    name: {
        type: String,
        maxlength: 24,
        trim: true
    },
    displayedName: {
        type: String,
        maxlength: 16,
        trim: true
    },
    friends: [{
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        displayedName: String
    }],
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    },
    lastActivity: {
        type: Date
    }
})
module.exports = UserModel;
