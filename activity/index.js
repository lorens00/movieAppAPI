// Import Statements
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Route Imports
const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movie');

// Initialize Express App
const app = express();

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Allow all origins
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_STRING);
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

// Route Handling
app.use('/users', userRoutes);
app.use('/movies', movieRoutes);

// Server Initialization
if (require.main === module) {
    app.listen(process.env.PORT || 4000, () => {
        console.log(`API is now online on port ${process.env.PORT || 4000}`);
    });
}

// Module Exports
module.exports = { app, mongoose };