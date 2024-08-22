const Movie = require('../models/movie');
const Comment = require('../models/comment');
const { errorHandler } = require('../auth');

// Add a new movie
module.exports.addMovie = async (req, res) => {
    try {
        const { title, director, year, description, genre } = req.body;

        if (!title || !director || !year || !description || !genre) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        const newMovie = new Movie({
            title,
            director,
            year,
            description,
            genre,
            comments: []
        });

        await newMovie.save();
        res.status(201).send({
            title: newMovie.title,
            director: newMovie.director,
            year: newMovie.year,
            description: newMovie.description,
            genre: newMovie.genre,
            _id: newMovie._id,
            comments: newMovie.comments,
            __v: newMovie.__v
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

// Get all movies
module.exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().populate('comments');

        const formattedMovies = movies.map(movie => ({
            _id: movie._id,
            title: movie.title,
            director: movie.director,
            year: movie.year,
            description: movie.description,
            genre: movie.genre,
            comments: movie.comments.map(comment => ({
                userId: comment.user,
                comment: comment.text,
                _id: comment._id
            }))
        }));

        res.status(200).send({ movies: formattedMovies });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

// Get a single movie by ID
module.exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id).populate('comments');
        if (!movie) {
            return res.status(404).send({ message: 'Movie not found' });
        }
        res.status(200).send(movie);
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

// Update a movie by ID
module.exports.updateMovie = async (req, res) => {
    try {
        const { title, director, year, description, genre } = req.body;

        if (!title || !director || !year || !description || !genre) {
            return res.status(400).send({ message: 'All fields are required' });
        }

        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedMovie) {
            return res.status(404).send({ message: 'Movie not found' });
        }
        res.status(200).send({ message: "Movie updated successfully", updatedMovie });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

// Delete a movie by ID
module.exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).send({ message: 'Movie not found' });
        }
        res.status(200).send({ message: "Movie deleted successfully"});
    } catch (err) {
        return errorHandler(err, req, res);
    }
};

module.exports.addMovieComment = async (req, res) => {
    try {
        const { commentText } = req.body;
        const { movieId } = req.params; // Get movieId from URL params
        const { id: userId } = req.user; // Assuming `req.user` contains the authenticated user's ID

        console.log('User ID:', userId); // Debug statement

        // Validate input
        if (!commentText) {
            return res.status(400).send({ message: 'Comment text is required' });
        }

        if (!userId) {
            return res.status(400).send({ message: 'User ID is required' });
        }

        // Find the movie by ID
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).send({ message: 'Movie not found' });
        }

        // Create and save the new comment
        const newComment = new Comment({
            text: commentText,
            movie: movieId,
            user: userId  // Add user field
        });
        await newComment.save();

        // Add the comment to the movie's comments array and save the movie
        movie.comments.push(newComment._id);
        const updatedMovie = await movie.save();

        // Respond with a success message and the updated movie
        res.status(200).send({
            message: 'Comment added successfully',
            updatedMovie: {
                _id: updatedMovie._id,
                title: updatedMovie.title,
                director: updatedMovie.director,
                year: updatedMovie.year,
                description: updatedMovie.description,
                genre: updatedMovie.genre,
                comments: [
                    {
                        userId: newComment.user,
                        comment: newComment.text,
                        _id: newComment._id
                    }
                ]
            }
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};



// Get comments for a specific movie
module.exports.getMovieComments = async (req, res) => {
    try {
        const { movieId } = req.params;
        console.log('Movie ID:', movieId); // Debug statement

        const movie = await Movie.findById(movieId).populate('comments');
        if (!movie) {
            return res.status(404).send({ message: 'Movie not found' });
        }

        const comments = movie.comments.map(comment => ({
            userId: comment.user,
            comment: comment.text,
            _id: comment._id
        }));

        res.status(200).send({
            comments: comments
        });
    } catch (err) {
        return errorHandler(err, req, res);
    }
};
