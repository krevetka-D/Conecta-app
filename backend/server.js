// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import your existing routes
import userRoutes from './routes/userRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import checklistRoutes from './routes/checklistRoutes.js';

// Import the new dashboard routes
import dashboardRoutes from './routes/dashboardRoutes.js';
import configRoutes from './routes/configRoutes.js'; // Make sure this is imported

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// --- Mount your API routes here ---
app.use('/api/users', userRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/config', configRoutes); // FIX: Moved this line up

// --- Error Handling Middleware should be last ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});