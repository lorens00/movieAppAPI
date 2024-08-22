const jwt = require("jsonwebtoken");
require('dotenv').config();


// Function to create access token
module.exports.createAccessToken = (user) => {

	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin,
		role: user.role
	};

	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
}

// Token verification
module.exports.verify = (req, res, next) => {
    console.log("Authorization Header:", req.headers.authorization);

    let token = req.headers.authorization;

    if (typeof token === "undefined") {
        return res.status(401).send({ auth: "Failed. No Token" });
    } else {
        token = token.slice(7, token.length);
        console.log("Token:", token);

        // Token verification
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                return res.status(401).send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                console.log("Decoded Token:", decodedToken);
                req.user = decodedToken;
                next();
            }
        });
    }
};

// Middleware to verify if the user is an admin
module.exports.verifyAdmin = (req, res, next) => {
	console.log("Result from verifyAdmin method");
	console.log(req.user);

	// Checks if the owner of the token is an admin.
	if(req.user.isAdmin) {
		// If it is, move to the next middleware/controller using next() method.
		next();
	} else {
		// Else, end the request-response cycle by sending the appropriate response and status code.
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}


// Error handler
module.exports.errorHandler = (err, req, res, next) => {
	console.log(err);

	const statusCode = err.status || 500
	const errorMessage = err.message || 'Internal Server Error';

	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	})
}


// Middleware to check if the use is authenticated
module.exports.isLoggedIn = (req, res, next) => {

	if(req.user) {
		next();
	} else {
		res.sendStatus(401);
	}
}


module.exports.verifyUser = (req, res, next) => {
    console.log("Result from verifyUser method");
    console.log(req.user);

    // Checks if the owner of the token is a user.
    if (req.user && !req.user.isAdmin) {
        // If it is, move to the next middleware/controller using next() method.
        next();
    } else {
        // Else, end the request-response cycle by sending the appropriate response and status code.
        return res.status(403).send({
            auth: "Failed",
            message: "Access denied: You do not have the required permissions to perform this action"
        });
    }
};

