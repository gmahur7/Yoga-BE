const { mongoose, Schema } = require("mongoose");

const paymentSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    payment_id:String,
    payment_token:String,
    purpose:String,
    amount: Number,
    status: String,
    plan: String,
    duration:Number,
    points:Number
  },{
    timestamps:true
})

const PaymentModel = mongoose.model('Payment',paymentSchema);

module.exports =  PaymentModel;