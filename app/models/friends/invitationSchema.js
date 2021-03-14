const { Schema } = require('mongoose');

const invitationSchema = new Schema({

    sender: {
        _id: Schema.Types.ObjectId,
        name: String,
        displayedName: String
    },
    reciver: {
        _id: Schema.Types.ObjectId,
        name: String,
        displayedName: String
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined']
    },
    resolved: Boolean
}, {
    timestamps: true
});

module.exports = invitationSchema;