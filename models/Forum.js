import mongoose from 'mongoose';

const forumSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    threads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Thread' }],
}, { timestamps: true });

const Forum = mongoose.model('Forum', forumSchema);
export default Forum;