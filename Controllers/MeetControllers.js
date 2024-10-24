const { default: mongoose } = require('mongoose');
const MeetModel = require('../Models/MeetModel'); // Adjust the path according to your project structure
const UserModel = require('../Models/UserModel');

// Fetch all meetings
const fetchMeetings = async (req, res) => {
    try {
        const meetings = await MeetModel.find()
        // .populate('meetname').populate('invitedUsers').populate('joinedUsers');
        return res.status(200).json({ success: true, data: meetings });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({ success: false, message: 'Error fetching meetings.' });
    }
};

// Add a new meeting
const addMeeting = async (req, res) => {
    const { url, name, date, category } = req.body;
    if (!name || !url || !category) {
        return res.status(400).json({ success: false, message: 'Please provide meeturl and meetname.' });
    }

    try {
        const newMeeting = new MeetModel({ meeturl: url, meetname: name, invitedUsers: [], meetdate: date, category });
        await newMeeting.save();
        return res.status(201).json({ success: true, data: newMeeting });
    } catch (error) {
        console.error('Error adding meeting:', error);
        return res.status(500).json({ success: false, message: 'Error adding meeting.' });
    }
};

// Update a meeting
const updateMeeting = async (req, res) => {
    const { id } = req.params;
    const { meeturl, meetname, meetdate, category } = req.body;

    try {
        const updatedMeeting = await MeetModel.findByIdAndUpdate(id, { meeturl, meetname, meetdate, category }, { new: true });
        if (!updatedMeeting) {
            return res.status(404).json({ success: false, message: 'Meeting not found.' });
        }
        return res.status(200).json({ success: true, data: updatedMeeting });
    } catch (error) {
        console.error('Error updating meeting:', error);
        return res.status(500).json({ success: false, message: 'Error updating meeting.' });
    }
};

// Delete a meeting
const deleteMeeting = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMeeting = await MeetModel.findByIdAndDelete(id);
        if (!deletedMeeting) {
            return res.status(404).json({ success: false, message: 'Meeting not found.' });
        }
        return res.status(200).json({ success: true, message: 'Meeting deleted successfully.' });
    } catch (error) {
        console.error('Error deleting meeting:', error);
        return res.status(500).json({ success: false, message: 'Error deleting meeting.' });
    }
};

const joinMeeting = async (req, res) => {
    const { id } = req.params;
    const currentUser = req.user

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing meeting ID.',
        });
    }

    const meeting = await MeetModel.findById(id)

    if (!meeting) {
        return res.status(404).json({
            success: false,
            message: 'Meeting not found.'
        });
    }

    const user = await UserModel.findById(currentUser._id)

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found.'
        });
    }

    // console.log(meeting,user)

    try {

        const today = new Date(); // Current date and time
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Only the date part (without time)

        const isTodayPresent = user.attendence.some((attDate) => {
            const attendanceDateOnly = new Date(attDate.getFullYear(), attDate.getMonth(), attDate.getDate());
            return attendanceDateOnly.getTime() === todayDateOnly.getTime(); // Compare dates only
        });

        if (!isTodayPresent) {
            user.attendence.push(todayDateOnly); // Push only the date part (without time)
            await user.save();
        }

        return res.status(200).json({
            success: true,
            url: meeting.meeturl,
        });

    } catch (error) {
        console.error('Error deleting meeting:', error);
        return res.status(500).json({ success: false, message: 'Error deleting meeting.' });
    }
};

const fetchMeetingsPerUser = async (req, res) => {
    try {
        const meetings = await MeetModel.find().select("-meeturl")
        return res.status(200).json({ success: true, data: meetings });
    } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({ success: false, message: 'Error fetching meetings.' });
    }
};

module.exports = {
    fetchMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    fetchMeetingsPerUser,
    joinMeeting
};
