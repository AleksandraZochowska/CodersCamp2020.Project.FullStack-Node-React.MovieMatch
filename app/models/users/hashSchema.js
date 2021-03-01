const mongoose = require('mongoose');

const hashSchema = mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    hash: String,
    updatedAt: Date,

});

module.exports = hashSchema;