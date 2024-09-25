const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required."],
        unique: true,
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
        unique: true,
        trim: true,
        // required: [true, "description is required."],
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
