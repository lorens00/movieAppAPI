const User = require('../models/User');
const auth = require('../auth')
const bcrypt = require('bcryptjs');
const { errorHandler } = auth;

module.exports.registerUser = (req, res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")) {
        return res.status(400).send({ message: 'Invalid email format' });
    }

    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11) {
        return res.status(400).send({ message: 'Mobile number is invalid' });
    }

    // Checks if the password has at least 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be at least 8 characters long' });
    } else {

        // Check if user already exists
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (user) {
                    return res.status(400).send({ message: 'User already exists' });
                } else {
                    // Create a new user
                    let newUser = new User({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email: req.body.email,
                        password: bcrypt.hashSync(req.body.password, 10), // 10 salt rounds
                        mobileNo: req.body.mobileNo
                    });
                    // Save the new user to the database
                    return newUser.save()
                        .then(() => res.status(201).send({ message: "Registered Successfully" }))
                        .catch(err => res.status(500).send({ message: err.message }));
                }
            })
            .catch(err => res.status(500).send({ message: err.message }));
    }
};

module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({ message: 'Email and password are required' });
        }

        if (!email.includes("@")) {
            return res.status(400).send({ message: 'Invalid email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).send({ error: 'No email found' });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);

        if (isPasswordCorrect) {
            return res.status(200).send({ 
                access: auth.createAccessToken(user)
            });
        } else {
            return res.status(401).send({ error: 'Email and password do not match' });
        }
    } catch (err) {
        return errorHandler(err, req, res);
    }
};


module.exports.getUserDetails = (req, res) => {
    if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
    }

    User.findById(req.user.id)
        .then(user => {
            if (!user) {
                return res.status(404).send({ error: 'User not found' });
            }

            console.log(user); 
            user.password = ""; 
            return res.status(200).send({ 
                user: user 
            });
        })
        .catch(err => errorHandler(err, req, res));
};