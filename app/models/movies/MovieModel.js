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

    deleteFromCollection(movieId) {
        
        return new Promise((resolve, reject) => {
            
            this.collection.user.movies = this.collection.user.movies.filter((movie) => {
                return (movie.imdbId !== movieId);
            } ); 
            
            this.collection.save((error, savedDoc) => {
                if(error) reject(error);
                this.collection = savedDoc;
                resolve(savedDoc);
            });
        });
    }

    toggleWatchedFlag(movieId) {

        return new Promise((resolve, reject) => {
            
            const index = this.collection.user.movies.findIndex((movie) => {
                return movie.imdbId === movieId;
            });

            let flag = (this.collection.user.movies[index].watched === true) ? false : true;
            this.collection.user.movies[index].watched = flag;
            
            this.collection.save((error, savedDoc) => {
                if(error) reject(error);
                this.collection = savedDoc;
                resolve(flag);
            });
        });
    }
}

module.exports = MovieModel;
