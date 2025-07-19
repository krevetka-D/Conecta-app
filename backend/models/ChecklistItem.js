// backend/models/ChecklistItem.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const checklistItemSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            index: true, // Add single field index
        },
        itemKey: {
            type: String,
            required: true,
            index: true, // Add single field index
        },
        isCompleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Adding compound index with the correct field name
checklistItemSchema.index({ user: 1, itemKey: 1 }, { unique: true });

// Removing any potential duplicate model compilation
const ChecklistItem = mongoose.models.ChecklistItem || mongoose.model('ChecklistItem', checklistItemSchema);

export default ChecklistItem;