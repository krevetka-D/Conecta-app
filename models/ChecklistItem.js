
import mongoose from 'mongoose';

const checklistItemSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemKey: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

checklistItemSchema.index({ userId: 1, itemKey: 1 }, { unique: true });

const ChecklistItem = mongoose.model('ChecklistItem', checklistItemSchema);
export default ChecklistItem;