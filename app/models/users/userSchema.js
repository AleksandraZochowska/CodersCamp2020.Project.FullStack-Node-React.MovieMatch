const { Schema } = require('mongoose');

const userSchema = new Schema({

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
        trim: true,
        unique: true
    },

    friends: [{
        _id: Schema.Types.ObjectId,
        name: String,
        displayedName: String
    }],

    lastActivity: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = userSchema;
