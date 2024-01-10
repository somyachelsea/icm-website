const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');  // Import the dotenv package

// Load the environment variables from .env file
dotenv.config();

const app = express();
app.use(cors());

app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/users', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const User = require("./db/user");

// Register Route
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Login Route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('password : ' + password);

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send('Invalid email');
        }

        console.log('found');

        // Print hashed password for debugging
        console.log('Stored Hash:', user.password);

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);

        console.log(isMatch);

        

        if (!isMatch) {
            return res.status(400).send('Invalid password');
        }

        console.log('matchh');

        // Generate JWT token

        const secretKey = process.env.secret_key;

        console.log(secretKey);

        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.listen(5000, () => {
    console.log(`Server is running on port ${5000}`);
});