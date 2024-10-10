// const instamojo = require('@api/instamojo');
const User = require('../Models/UserModel');
const PaymentModel = require('../Models/Payments');
const moment = require("moment");
const UserModel = require('../Models/UserModel');

const getPaymentToken = async (req, res) => {

  const { phoneNumber,countryCode } = req.body;
  
  const user = await User.findOne({ phoneNumber:`${countryCode}${phoneNumber}` });

  if (!user) {
    return res.status(404).send({
      success: false,
      error: "User not found",
    });
  }
  try {

    let response = await fetch('https://test.instamojo.com/oauth2/token/', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.INSTAMOJO_CLIENT_ID,
        client_secret: process.env.INSTAMOJO_CLIENT_SECRET,
      })
    })

    response = await response.json()

    console.log("tokenresp: ", response)
    const token = response.access_token;

    if (!token) {
      return res.status(404).send({
        success: false,
        error: "Token not found",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Token created successfully",
      data: token
    });

  } catch (error) {
    console.error("error in creating payment token: " + error)
    return res.status(200).send({
      success: false,
      error: error,
    });

  }
}

const createPayment = async (req, res) => {
  const { amount, phone, email, purpose, token,plan,countryCode } = req.body;
  const user = await User.findOne({ phoneNumber:`${countryCode}${phone}`  });

  if (!user) {
    return res.send({
      success: false,
      error: "User not found",
    });
  }

  try {

    let response = await fetch('https://test.instamojo.com/v2/payment_requests/', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      },
      body: JSON.stringify({
        allow_repeated_payments: false,
        send_email: true,
        amount: amount,
        purpose: purpose,
        buyer_name: user.username,
        email: email,
        phone: user.phone,
        redirect_url: `${process.env.INSTAMOJO_REDIRECT_URL}/?token=${token}`,
        webhook: process.env.INSTAMOJO_WEBHOOK_URL,
        // expires_at: '100',
      })
    })

    response = await response.json()

    if (!response.id) {
      return res.status(200).send({
        success: false,
        error: response.message,
      });
    }

    const payment = await PaymentModel.create({
      userId: user._id,
      payment_id: response.id,
      purpose,
      amount,
      status: response.status,
      payment_token: token,
      plan,
      duration:12
    })

    if (!payment) {
      return res.status(200).send({
        success: false,
        error: 'Failed to create payment',
      });
    }

    return res.status(200).send({
      success: true,
      data: response.longurl,
    });

  } catch (err) {
    console.log(err);
    return res.send({
      success: false,
      error: err,
    });
  }
};

const checkstatus = async (req, res) => {
  const { payment_request_id, token } = req.query
  // console.log("query: ", payment_request_id, token)

  const payment = await PaymentModel.findOne({
    payment_id: payment_request_id
  })

  if (!payment) {
    return res.send({
      success: false,
      error: 'Payment not found',
    });
  }

  const user = await UserModel.findOne({
    _id:payment.userId
  })

  if (!payment) {
    return res.send({
      success: false,
      error: 'User not found',
    });
  }

  try {

    let response = await fetch(`https://test.instamojo.com/v2/payment_requests/${payment_request_id}`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `bearer ${token}`
      },
    })

    response = await response.json()

    if (response.success === false) {
      return res.redirect(process.env.PAYMENT_FAILURE_URL)
      // return res.send({
      //   success: false,
      //   error: response.message,
      // });
    }

    if (response.status === 'Pending') {
      return res.redirect(process.env.PAYMENT_FAILURE_URL)
    }

    payment.status = 'Completed'
    await payment.save()

    const now = new Date();
    const nextPaymentDate = moment(now).add(12, 'months').toDate();

    // Update user payment details
    user.isFirstPayment = false;
    user.paymentType = payment.plan;
    user.paymentDate = now;
    user.nextPaymentDate = nextPaymentDate;

    await user.save();



    return res.redirect(process.env.PAYMENT_SUCCESS_URL)
    // return res.status(200).send({
    //   success: true,
    //   data: response,
    // });

  } catch (err) {
    console.log(err);
    return res.redirect(process.env.PAYMENT_FAILURE_URL)
    // return res.send({
    //   success: false,
    //   error: err,
    // });
  }
};

const getCompletedPayments = async (req, res) => {
  try {
    const completedPayments = await PaymentModel.find({ status: "Completed" }).populate('userId'); // Populate user data if necessary

    if (completedPayments.length > 0) {
      return res.status(200).json({
        success: true,
        payments: completedPayments
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No completed payments found"
      });
    }
  } catch (error) {
    console.error('Error fetching completed payments:', error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const addPaymentCustom = async (req, res) => {
  const { user, duration, plan, purpose } = req.body;
  console.log(req.body)

  if (!duration || !plan || !user || !purpose) {
    return res.status(400).json({ success: false, error: 'Please provide all the details: duration, plan, and purpose.' });
  }

  // Define the amount based on the selected plan
  let amount;
  switch (plan) {
    case 'Free':
      amount = 0;
      break;
    case 'Silver':
      amount = 99;
      break;
    case 'Gold I':
      amount = 23999;
      break;
    case 'Gold II':
      amount = 17999;
      break;
    default:
      return res.status(400).json({ success: false, error: 'Invalid payment plan.' });
  }

  try {
    // Fetch the user from the database
    const foundUser = await User.findById(user._id).select("-password");

    if (!foundUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const payment = await PaymentModel.create({
      userId: foundUser._id,
      amount,
      duration,
      payment_id: 'custom',
      payment_token: 'custom',
      purpose,
      status: 'Completed',
      plan
    });

    if (!payment) {
      return res.status(200).json({
        success: false,
        message: 'Payment failed',
      });
    }

    const now = new Date();
    const nextPaymentDate = moment(now).add(duration, 'months').toDate();

    // Update user payment details
    foundUser.isFirstPayment = false;
    foundUser.paymentType = plan;
    foundUser.paymentDate = now;
    foundUser.nextPaymentDate = nextPaymentDate;

    await foundUser.save();

    return res.status(200).json({
      success: true,
      message: 'Payment added successfully',
      user: foundUser,
    });

  } catch (error) {
    console.error('Error adding payment:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add payment',
      error: error.message,
    });
  }
};


module.exports = {
  getPaymentToken,
  createPayment,
  checkstatus,
  getCompletedPayments,
  addPaymentCustom
}