import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
}, { timestamps: true });

const Post = mongoose.model('Post', PostSchema);
export default Post;