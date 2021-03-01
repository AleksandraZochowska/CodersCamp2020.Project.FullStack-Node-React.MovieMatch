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
        this.User = mongoose.model('User', userSchema);
    }

    addUser(name, email, password, displayedName) {

        const creationDate = new Date();       
        const userId = new mongoose.Types.ObjectId();

        hashModel.addHash(userId, password, creationDate);
        const user = new this.User({
            _id: userId,
            email: email,
            name: name,
            displayedName: displayedName + generatePseudoId(),
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

            //connect
            this.User
                .find({email: email})
                .exec()
                .then(user => {
                    //zamknąć poł. z bazą
                    resolve(user);
                })
                .catch(err => {
                    reject(err)
                    //czy też trzeba zamknąć poł z bazą?
                    console.log(err)
                });
        });
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


const pseudoIdLength = 6;

function generatePseudoId() {
    return "#" + Math.floor(Math.random() * (10 ** pseudoIdLength - 1)).toString().padStart(pseudoIdLength,"0");
}

module.exports = UserModel;
