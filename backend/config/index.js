// backend/config/index.js
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT,
    dbUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
};

export default config;