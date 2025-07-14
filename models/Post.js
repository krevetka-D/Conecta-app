// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);