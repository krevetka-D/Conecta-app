// models/ServiceDirectoryEntry.js

import mongoose from 'mongoose';

const serviceDirectoryEntrySchema = mongoose.Schema({
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['GESTOR', 'LAWYER', 'REAL_ESTATE', 'TRANSLATOR'], required: true },
    description: { type: String, required: true },
    contactInfo: { phone: String, email: String, website: String },
    isRecommended: { type: Boolean, default: false },
}, { timestamps: true });

const ServiceDirectoryEntry = mongoose.model('ServiceDirectoryEntry', serviceDirectoryEntrySchema);
export default ServiceDirectoryEntry;