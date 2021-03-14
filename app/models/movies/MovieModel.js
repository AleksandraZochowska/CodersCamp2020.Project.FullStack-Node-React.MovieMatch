const mongoose = require('mongoose');
const movieSchema = require('./movieSchema');

class MovieModel {

    constructor() {
        this.Movie = mongoose.model("Movie", movieSchema);
        this.collection;
    }

    createCollection(userId) {
        
        return new Promise((resolve, reject) => {

            const movie = new this.Movie({
                user: {
                    _id: userId,
                    movies: []
                }
            });

            movie.save()
            .then((movie) => {
                this.collection = movie;
                resolve(movie);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    findCollection(userId) {
        
        return new Promise((resolve, reject) => {
            
            this.Movie.findOne({"user._id": userId}, (error, collection) => {
                if(error) reject(error);
                this.collection = collection;
                resolve(collection);
            });
        });
    }

    addToCollection(movieId) {

        return new Promise((resolve, reject) => {
            
            const movieCard = {
                imdbId: movieId,
                watched: false
            };
            this.collection.user.movies.push(movieCard);

            this.collection.save((error, savedDoc) => {
                if(error) reject(error);
                this.collection = savedDoc;
                resolve(savedDoc);
            });
        });
    }

    checkIfInCollection(movieId) {

        return new Promise((resolve, reject) => {
            
            const isInCollection = this.collection.user.movies.some((movie) => {
                return (`${movie.imdbId}` === movieId);
            });
            resolve(isInCollection);
        });
    }
}

module.exports = MovieModel;
