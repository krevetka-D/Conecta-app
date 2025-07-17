import mongoose from 'mongoose';

const { Schema } = mongoose;

const checklistItemSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        itemKey: {
            type: String,
            required: true,
            // Example keys: 'OBTAIN_NIE', 'REGISTER_AUTONOMO', etc.
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

// Add compound index to ensure unique user-itemKey combinations
checklistItemSchema.index({ user: 1, itemKey: 1 }, { unique: true });

// This is the important change:
// It checks if the model is already compiled and uses it; otherwise, it compiles a new one.
export default mongoose.models.ChecklistItem || mongoose.model('ChecklistItem', checklistItemSchema);