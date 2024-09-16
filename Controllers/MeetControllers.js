const { v4: uuidv4 } = require('uuid');
const asyncHandler = require("express-async-handler");
const MeetModel = require("../Models/MeetModel");
const UserModel = require("../Models/UserModel");


const createMeet = asyncHandler(async (req, res) => {
    const host = req.user;
    const { users } = req.body

    try {
        // const id = nanoid(8)
        const meetId = uuidv4(8)
        // console.log(id)
        let meet = new MeetModel({
            host:host._id,
            meetId,
            invitedUsers: users,
            joinedUsers: []
        })
        meet = await meet.save()

        if (!meet) {
            return res.status(400).send({
                success: false,
                error: "Error in creating meet."
            })
        }

        return res.status(201).send({
            success: true,
            meetId
        })

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).send({
            success: false,
            error: "Server error"
        })
    }
})

const makeAttendence = asyncHandler(async (req, res) => {
    const { userid } = req.body
    const { id } = req.params

    console.log(id)
    if (!id) {
        return res.status(400).json({
            success: false,
            error: "Id is required!"
        });
    }

    if (!userid) {
        return res.status(400).json({
            success: false,
            error: "UserId is required!"
        });
    }

    try {

        const meet = await MeetModel.findOne({ meetId: id }).populate('invitedUsers joinedUsers');
        const user = await UserModel.findById(userid);

        console.log(user)

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found!"
            });
        }

        if (!meet) {
            return res.status(404).json({
                success: false,
                error: "Meet not found!"
            });
        }

        const isUserInvited = meet.invitedUsers.some(invitedUser => invitedUser._id.toString() === userid);

        if (!isUserInvited) {
            return res.status(403).json({
                success: false,
                error: "User Not Invited"
            });
        }

        const isUserJoined = meet.joinedUsers.some(joinedUser => joinedUser._id.toString() === userid);

        if (isUserJoined) {
            return res.status(400).json({
                success: false,
                error: "Already Added!"
            });
        }

        meet.joinedUsers.push(userid);
        await meet.save();

        return res.status(200).json({
            success: true,
            message: "Attendance registered!"
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
})

module.exports = {
    createMeet,
    makeAttendence
}