const Url = require('../server/models/url');

const validateTelegramId = async (req, res, next) => {
    const telegramId = req.originalUrl.split('/')[1]; // Adjust this based on your actual URL structure
    console.log(telegramId)
    
    try {
        const url = await Url.findOne({ 
            telegramId,
            isActive: true
        });

        // First check if URL exists
        if (!url) {
            return res.status(404).json({
                success: false,
                message: 'لینک معتبر نیست یا منقضی شده است'
            });
        }

        // Then check if it's expired
        if (url.isExpired()) {
            url.isActive = false;
            await url.save();
            
            return res.status(410).json({ // Using 410 Gone for expired resources
                success: false,
                message: 'لینک منقضی شده است'
            });
        }


        req.validUrl = url;
        next();
    } catch (error) {
        console.error('Error validating Telegram ID:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در بررسی لینک',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = validateTelegramId;