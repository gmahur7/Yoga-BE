const express=require('express')
const router=express.Router()
const { isAuthenticated } = require('../Helpers/JWT_Auth');
const { registerFAQ, fetchFAQs, updateFAQ, deleteFAQ } = require('../Controllers/FAQControllers');

router.route('/').post(registerFAQ).get(fetchFAQs) 
router.put('/update/:id', updateFAQ);      
router.delete('/delete/:id', deleteFAQ);   


module.exports = router; 