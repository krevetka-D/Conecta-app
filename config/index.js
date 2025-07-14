const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
    port: process.env.PORT,
    dbUri: process.env.DB_URI,
    jwtSecret: process.env.JWT_SECRET,
};