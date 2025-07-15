import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

// Import all route files
import userRoutes from './routes/userRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';
import contentRoutes from './routes/contentRoutes.js';

// Load environment variables
dotenv.config();
const port = process.env.PORT || 5000;

// Connect to database
connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount all routers to their API paths
app.use('/api/users', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/checklist', checklistRoutes); // New
app.use('/api/content', contentRoutes);   // New

// --- Serve frontend (for production deployment) ---
// In ES Modules, __dirname is not available directly. This is the modern way to get it.
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) =>
        res.sendFile(path.resolve(__dirname, '../', 'frontend', 'build', 'index.html'))
    );
} else {
    app.get('/', (req, res) => res.send('API is running...'));
}

// Use custom error handler
app.use(errorHandler);

// Start the server
app.listen(port, () => console.log(`Server started on port ${port}`));