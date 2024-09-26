const asyncHandler = require("express-async-handler");
const Video = require("../Models/VideoModel");

const sourceChange = (video)=>{
    let videoId=video.split('be/')[1]
    return "https://www.youtube.com/embed/"+videoId
}

const registerVideo = asyncHandler(async (req, res) => {
    const { title, source, category,description } = req.body

    if (!title  || !category ) {
        return res.status(400).json({
            success: false,
            error: 'Please provide all the fields'
        })
    }

    if(!source){
        return res.status(400).json({
            success: false,
            error: 'Please provide source of video'
        })
    }

    const newSource = sourceChange(source)

    // console.log(newSource)

    try {
        let video = await Video.findOne({ newSource })

        if (video) {
            return res.status(400).json({
                success: false,
                error: 'video already exists'
            })
        }

        let newVideo = await Video({
            source:newSource,title,category,description
        })

        newVideo = await newVideo.save();

        if (!newVideo) {
            return res.status(401).json({
                success: false,
                error: 'Error in registering new video!'
            })
        }

        return res.status(201).json({
            success: true,
            message: "video registerd successfully!"
        })

    } catch (error) {
        console.error("Error in registering video: " + error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
})

const fetchVideos = asyncHandler(async (req, res) => {
    try {
        const videos = await Video.find();

        if (!videos) {
            return res.status(404).json({
                success: false,
                error: "No videos found"
            });
        }

        return res.status(200).json({
            success: true,
            data: videos
        });

    } catch (error) {
        console.error("Error fetching videos: " + error);
        return res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
});

const updateVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, source, category,description } = req.body;

    if (!title  || !category ||!description) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the fields"
        });
    }

    if(!source){
        return res.status(400).json({
            success: false,
            error: 'Please provide source of video'
        })
    }

    const newSource = sourceChange(source)

    try {
        let video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "video not found"
            });
        }

        await Video.findByIdAndUpdate(id, {
            title,
            source:source.includes('/embed/')?source:newSource,
            category,
            description
        }, {
            new: true
        })

        return res.status(200).json({
            success: true,
            message: "video updated successfully"
        });

    } catch (error) {
        console.error("Error updating video: " + error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const video = await Video.findById(id);

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "video not found"
            });
        }

        await Video.findByIdAndDelete(id)

        return res.status(200).json({
            success: true,
            message: "video deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting video: " + error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


module.exports = {
    registerVideo,
    fetchVideos,
    updateVideo,
    deleteVideo
}