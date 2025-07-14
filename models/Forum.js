// models/Forum.js
const mongoose = require('mongoose');

const ForumSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tag: { type: String, required: true, unique: true },
    description: { type: String },
    isCitySpecific: { type: Boolean, default: false },
});

module.exports = mongoose.model('Forum', ForumSchema);