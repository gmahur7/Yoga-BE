const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required."],
        trim: true,
    },
    source: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "Source is required."],
    },
    description: {
        type: String,
        trim: true,
    },
    category:{
        type:String,
        required: [true, "Category is required."],
    }

}, {
    timestamps: true
});

const Video = mongoose.model("videos", videoSchema);
module.exports = Video;
