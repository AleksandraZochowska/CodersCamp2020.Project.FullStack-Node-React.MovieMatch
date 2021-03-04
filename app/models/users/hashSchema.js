const { Schema } = require('mongoose');

const hashSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    hash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = hashSchema;