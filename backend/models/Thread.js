import mongoose from 'mongoose';

const ThreadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
}, { timestamps: true });

const Thread = mongoose.model('Thread', ThreadSchema);
export default Thread;