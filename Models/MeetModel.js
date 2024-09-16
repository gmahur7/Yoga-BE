const mongoose = require('mongoose')

const meetSchema = new mongoose.Schema({
    meetId: {
        type: String,
        required: true,
        unique: true
    },
    host: { type: mongoose.Schema.ObjectId, ref: 'User' },
    invitedUsers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    joinedUsers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }]
}, {
    timestamps: true,
})

const MeetModel = new mongoose.model('meets', meetSchema)

module.exports = MeetModel;