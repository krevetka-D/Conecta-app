// backend/config/db.js - Enhanced version
import mongoose from 'mongoose';

const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    // Optimize connection settings
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        // Connection pool settings
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 10000,
        // Performance settings
        writeConcern: {
            w: 'majority',
            j: true,
            wtimeout: 1000
        },
        readPreference: 'primaryPreferred',
        // Compression
        compressors: ['zlib'],
    };

    while (retries < maxRetries) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, options);

            console.log(`MongoDB Connected: ${conn.connection.host}`);

            // Enable query optimization
            mongoose.set('debug', process.env.NODE_ENV === 'development');
            mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

            // Connection event handlers
            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB disconnected. Attempting to reconnect...');
            });

            mongoose.connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
            });

            return conn;
        } catch (error) {
            retries++;
            console.error(`Database Connection Error (Attempt ${retries}/${maxRetries}):`, error.message);

            if (retries === maxRetries) {
                console.error('Max retries reached. Exiting...');
                process.exit(1);
            }

            const delay = Math.min(1000 * Math.pow(2, retries), 10000);
            console.log(`Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

export default connectDB;
