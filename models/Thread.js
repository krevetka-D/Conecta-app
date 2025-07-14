// models/Thread.js
const mongoose = require('mongoose');

const ThreadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Thread', ThreadSchema);