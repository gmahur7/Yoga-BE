const asyncHandler = require("express-async-handler");
const FAQ = require("../Models/FAQmodel");

const registerFAQ = asyncHandler(async (req, res) => {
    const { ques, ans, lang } = req.body

    if(!ques||!ans||!lang){
        return res.status(400).json({
            success: false,
            error: 'Please provide all the fields'
        })
    }

    try {
        let faq = await FAQ.findOne({ ques })

        if (faq) {
            return res.status(400).json({
                success: false,
                error: 'FAQ already exists'
            })
        }

        let newFaq = await FAQ({
            ques, ans, lang
        })

        newFaq = await newFaq.save();

        if(!newFaq){
            return res.status(401).json({
                success: false,
                error: 'Error in registering new faq!'
            })
        }

        return res.status(201).json({
            success: true,
            message:"FAQ registerd successfully!"
        })

    } catch (error) {
        console.error("Error in registering FAQ: " + error)
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
})

const fetchFAQs = asyncHandler(async (req, res) => {
    try {
        const faqs = await FAQ.find();

        if (!faqs) {
            return res.status(404).json({
                success: false,
                error: "No FAQs found"
            });
        }

        return res.status(200).json({
            success: true,
            data: faqs
        });

    } catch (error) {
        console.error("Error fetching FAQs: " + error);
        return res.status(500).json({
            success: false,
            error: "Server Error"
        });
    }
});

const updateFAQ = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ques, ans, lang } = req.body;

    if (!ques || !ans || !lang) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the fields"
        });
    }

    try {
        let faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }

        faq.ques = ques;
        faq.ans = ans;
        faq.lang = lang;

        await faq.save();

        return res.status(200).json({
            success: true,
            message: "FAQ updated successfully"
        });
    } catch (error) {
        console.error("Error updating FAQ: " + error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

const deleteFAQ = asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: "FAQ not found"
            });
        }
        
        await FAQ.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "FAQ deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting FAQ: " + error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});


module.exports = {
    registerFAQ,
    fetchFAQs,
    updateFAQ,
    deleteFAQ
}