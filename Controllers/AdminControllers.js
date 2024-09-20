const asyncHandler = require("express-async-handler");
const Admin = require("../Models/AdminModel");
const { generateToken } = require("../Helpers/JWT_Auth");

const authAdmin = asyncHandler(async (req, res) => {
    const { phoneNumber, password } = req.body

    try {
        let admin = await Admin.findOne({ phoneNumber })

        if (!admin) {
            return res.status(200).json({
                success: false,
                error: 'Admin not found'
            })
        }

        if (admin.password !== password) {
            return res.status(200).json({
                success: false,
                error: 'Invalid Password'
            })
        }

        const token = generateToken(admin._id);

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        });


        const adminDetails = await Admin.findById(admin._id).select('-password')

        return res.status(200).json({
            success: true,
            admin: adminDetails,
            token,
        })

    } catch (error) {
        console.error("Error in login admin: " + error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
})

module.exports = {
    authAdmin
}