const { Schema } = require('mongoose');

const fileSchema = new Schema({

    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
}, {
    timestamps: true
});

module.exports = fileSchema;