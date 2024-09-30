const asyncHandler = require("express-async-handler");
const Admin = require("../Models/AdminModel");
const jwt = require('jsonwebtoken')
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

const verifyAdmin = async (req, res) => {
    let token;
    const authHeader = req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7);

        if (!token) {
            return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_KEY);

            const admin = await Admin.findById(decoded.id).select("-password");

            if (!admin) {
                return res.status(404).json({ success: false, error: 'Admin not found' });
            }

            return res.status(200).json({ success: true, admin: admin });
        } catch (error) {
            return res.status(400).json({ success: false, error: 'Invalid token.' });
        }
    }
};

module.exports = {
    authAdmin,
    verifyAdmin
}