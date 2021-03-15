const { Schema } = require('mongoose');

const movieSchema = new Schema({

    user: {
        _id: Schema.Types.ObjectId,
        movies: [{
            imdbId: String,
            watched: Boolean
        }]
    }
}, {
    timestamps: true
});

module.exports = movieSchema;