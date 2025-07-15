// models/Guide.js

import mongoose from 'mongoose';

const guideSchema = mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    path: { type: String, enum: ['FREELANCER', 'ENTREPRENEUR', 'GENERAL'], required: true },
}, { timestamps: true });

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;