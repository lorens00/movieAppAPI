const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie');
const { verify, verifyAdmin } = require("../auth");

// Create a new movie
router.post('/addMovie', verify, verifyAdmin, movieController.addMovie);

// Get all movies
router.get('/getMovies', verify, movieController.getAllMovies);

// Get a single movie by ID
router.get('/getMovie/:id', verify, movieController.getMovieById);

// Update a movie by ID
router.patch('/updateMovie/:id', verify, verifyAdmin, movieController.updateMovie);

// Delete a movie by ID
router.delete('/deleteMovie/:id', verify, verifyAdmin, movieController.deleteMovie);

// Add a comment to a movie
router.patch('/addComment/:movieId', verify, movieController.addMovieComment);

// Get comments for a movie
router.get('/getComments/:movieId', verify, movieController.getMovieComments);
module.exports = router;
