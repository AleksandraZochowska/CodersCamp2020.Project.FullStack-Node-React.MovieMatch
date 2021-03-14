const Controller = require("../Controller");
const MovieModel = require('../../models/movies/MovieModel');
const axios = require('axios');

class MovieController extends Controller {
    constructor(req, res) {
        super(req, res);
        this.movieModel = new MovieModel();
    }
    
    async searchMovies() {
        try {
            if(!this.query.title) return this.showError(400, "Provide movie title to search by");                          
            
            // Get movies data from OMDb API by title:
            const page = this.query.page ? `&page=${this.query.page}` : `&page=1`;
            const movie = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_KEY}&s=${this.query.title}${page}`);
            if(!movie) return this.showError(500, "Search failed - try again later");                          

            return this.success(movie.data.Search);

        } catch(error) {
            return this.showError(500);
        }
    }

    async showMovieDetails() {
        try {
            // Get movie data from OMDb API by movieID:
            const movie = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_KEY}&i=${this.params.movieid}`);
            if(movie.data.Error === "Incorrect IMDb ID.") return this.showError(400, "Provide valid movie ID");
            if(movie.data.Error) return this.showError(500);
            
            const { Title, imdbRating, Runtime, Year, Country, Genre, Director, Actors, Awards, Plot, Poster } = movie.data;
            const movieDetails = { Title, imdbRating, Runtime, Year, Country, Genre, Director, Actors, Awards, Plot, Poster }
            
            return this.success(movieDetails);

        } catch(error) {
            return this.showError(500);
        }
    }

    async addMovieToLiked() {
        try {
            // Get movie data from OMDb API by imdbID:
            const movie = await axios.get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_KEY}&i=${this.params.movieid}`);
            if(movie.data.Error === "Incorrect IMDb ID.") return this.showError(400, "Provide valid movie ID");
            if(movie.data.Error) return this.showError(500);

            // Check if user has a movie collection created:
            const collectionExists = await this.movieModel.findCollection(this.req.userId);

            // If user does not have a collection, create a collection:
            if(!collectionExists) {
                const createdCollection = await this.movieModel.createCollection(this.req.userId);
                if(!createdCollection) return this.showError(500, "Could not create new collection - try again later.");
            }
            
            // Check if user doesn't have this movie already in collection:
            const movieInCollection = await this.movieModel.checkIfInCollection(movie.data.imdbID);
            if(movieInCollection) return this.showError(409, "Movie is already in your collection");

            // Add movie to user's collection:
            const movieAdded = await this.movieModel.addToCollection(movie.data.imdbID);
            if(!movieAdded) return this.showError(500, "Could not add movie to collection - try again later.");

            return this.success(`You have added ${movie.data.Title} to your collection`);

        } catch(error) {
            return this.showError(500);
        }
    }

    async deleteMovieFromLiked() {
        try {
            // Check if user has a movie collection:
            const collectionExists = await this.movieModel.findCollection(this.req.userId);
            if(!collectionExists) return this.showError(404, "Collection not found");
            
            // Check if the movie is in user's collection:
            const movieInCollection = await this.movieModel.checkIfInCollection(this.params.movieid);
            if(!movieInCollection) return this.showError(404, "Movie not found in collection");

            // Delete movie from user's collection:
            const movieDeleted = await this.movieModel.deleteFromCollection(this.params.movieid);
            if(!movieDeleted) return this.showError(500, "Could not remove movie from collection - try again later.");

            return this.success(`You have removed movie from your collection`);

        } catch(error) {
            return this.showError(500);
        }
    }

    async toggleWatched() {
        try {
            // Check if user has a movie collection:
            const collection = await this.movieModel.findCollection(this.req.userId);
            if(!collection) return this.showError(404, "Collection not found");
            
            // Check if the movie is in user's collection:
            const movieInCollection = await this.movieModel.checkIfInCollection(this.params.movieid);
            if(!movieInCollection) return this.showError(404, "Movie not found in collection");

            // Toggle flag:
            const toggledFlag = await this.movieModel.toggleWatchedFlag(this.params.movieid);
            return this.success(`Watched changed to: ${toggledFlag}`);

        } catch(error) {
            return this.showError(500);
        }
    }
}

module.exports = MovieController;
