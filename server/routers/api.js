const express = require('express');
const { validationResult, body } = require('express-validator');
const Url = require('../models/url');
const router = express.Router();

// Middleware to check API key
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
        return res.status(401).json({ 
            error: 'API key missing',
            message: 'Please provide an API key in the X-API-KEY header or api_key query parameter'
        });
    }

    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({ 
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }

    next();
};

// Define the minimum and maximum length for Telegram user IDs
const MIN_TELEGRAM_USER_ID_LENGTH = 5;
const MAX_TELEGRAM_USER_ID_LENGTH = 20;



router.post('/create/digikala', 
    apiKeyAuth,
    body('userid')
        .isString()
        .isLength({ min: MIN_TELEGRAM_USER_ID_LENGTH, max: MAX_TELEGRAM_USER_ID_LENGTH })
        .withMessage(`User ID must be a string between ${MIN_TELEGRAM_USER_ID_LENGTH} and ${MAX_TELEGRAM_USER_ID_LENGTH} characters long.`)
        .matches(/^\d+$/)
        .withMessage('User ID must contain only numeric characters.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userid } = req.body;
        const BASE_URL = process.env.BASE_URL + '/' + userid

        const existUser = await Url.findOne({telegramId : userid})
        if (existUser){
            if (existUser.isActive){
                return res.status(401).json({message : 'An active link already exist in our database!'})
            };
        };
        
        try {
            const newLink = await Url.create({
                    telegramId : userid,
                    link : BASE_URL
            })
            console.log(newLink)

            res.status(201).json({ 
                message: 'URL created successfully',
                url: BASE_URL,
                userid: userid
            });

        } catch (error) {
            console.error('Error creating URL:', error);
            res.status(500).json({ 
                error: 'Failed to create URL',
                details: error.message 
            });
        }
    }
);

module.exports = router;