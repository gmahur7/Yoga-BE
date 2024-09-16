const { mongoose, Schema } = require("mongoose");

const paymentSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    currency: String,
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    status: String,
    duration:Number,
    points:Number
  },{
    timestamps:true
})

const PaymentModel = mongoose.model('Payment',paymentSchema);

module.exports =  PaymentModel;