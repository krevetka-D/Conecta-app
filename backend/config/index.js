const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: process.env.PORT,
    dbUri: process.env.DB_URI,
    jwtSecret: process.env.JWT_SECRET,
};