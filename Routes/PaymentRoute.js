const express = require("express");
const {createPayment, getPaymentToken, checkstatus, getCompletedPayments, addPaymentCustom } = require("../Controllers/PaymentControllers");
const { isAuthenticated } = require("../Helpers/JWT_Auth");
const router = express.Router();

router.post('/generate-token',getPaymentToken);
router.post('/create-payment',createPayment);
router.get('/check-status',checkstatus);
router.get('/get-payments',isAuthenticated,getCompletedPayments);
router.post('/custom-pay',isAuthenticated,addPaymentCustom);

module.exports = router;