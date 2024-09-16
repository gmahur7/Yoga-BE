const Razorpay = require('razorpay');
const crypto = require('crypto');
const PaymentModel = require("../Models/Payments");
const User = require('../Models/UserModel');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || " ",
    key_secret: process.env.RAZORPAY_KEY_SECRET || " ",
});

exports.createOrder = async (req, res) => {
    const { amount, currency, phoneNumber, duration, points } = req.body;
    // console.log(req.body)
    try {
        // Check if user exists, if not create a new user
        let user = await User.findOne({ phoneNumber });
        if (!user) {
            return res.json({
                success: false,
                message: "User Not Found"
            })
        }

        if (points) {
            if (user.refers.points < points) {
                return res.json({
                    success: false,
                    message: "Not Enough Points"
                })
            }
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
            receipt: 'receipt_' + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);

        const newOrder = new PaymentModel({
            userId: user._id,
            amount,
            currency,
            razorpay_order_id: order.id,
            status: 'created',
            duration: duration,
            points: points
        });

        await newOrder.save();

        // console.log(newOrder)

        res.json({
            order,
            user: {
                id: user._id, email: user.email, name: user.username, phoneNumber: user.phoneNumber, duration: newOrder.duration, points: newOrder.points
            }
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error.description });
    }
}

exports.verifyPayment = async (req, res) => {
    const { duration, razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, points } = req.body;
    // console.log(req.body)
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(400).json({ error: 'User not found' });

        const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const digest = shasum.digest('hex');

        if (digest === razorpay_signature) {
            let paymentDetail = await PaymentModel.findOneAndUpdate(
                { razorpay_order_id, userId: user._id },
                {
                    razorpay_payment_id,
                    razorpay_signature,
                    status: 'paid'
                }
            );
            // console.log(paymentDetail)

            let paymentDate = paymentDetail.updatedAt;
            let nextPaymentDate = new Date();

            if (new Date(user.nextPaymentDate) > Date.now()) {
                nextPaymentDate = new Date(user.nextPaymentDate)
            }

            switch (duration) {
                case 1:
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                    break;
                case 3:
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3);
                    break;
                case 12:
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 12);
                    break;
                default:
                    // If none of the cases match, nextPaymentDate will remain the current date.
                    break;
            }
            let newUpdated;
            if (points) {
                newUpdated = await User.findByIdAndUpdate(
                    { _id: user._id },
                    {
                        paymentDate: paymentDate,
                        nextPaymentDate: nextPaymentDate,
                        $inc: { "refers.points": -points }, // Decrease the points
                    },
                    { new: true }
                );
            } else {
                newUpdated = await User.findByIdAndUpdate(
                    { _id: user._id },
                    {
                        paymentDate: paymentDate,
                        nextPaymentDate: nextPaymentDate,
                    },
                    { new: true }
                );
            }

            user.refers = newUpdated.refers;

            if(user.isFirstPayment){
                await User.findOneAndUpdate({
                    _id:user.referBy
                },{
                    $inc: { "refers.points": 25 }
                },{
                    new:true
                }) 
                user.isFirstPayment=false;
                await user.save()
            }

            res.json({ status: 'ok' });
        } else {
            res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (error) {
        console.error("error: " + error)
        res.status(500).json({ error: error.description });
    }
}