// utils/logger.js
const Url = require('../models/url'); // Adjust path as needed

async function logToDatabase(telegramId, logType, logData) {
    try {
        // Stringify and truncate very large data to prevent buffer overflow
        const stringifiedData = JSON.stringify(logData);
        const processedData = stringifiedData.length > 1000000 
            ? JSON.parse(JSON.stringify(logData, (key, value) => 
                value && typeof value === 'object' ? value : String(value)))
            : logData;

        // Find and update or create new document
        await Url.findOneAndUpdate(
            { telegramId },
            {
                $push: {
                    logs: {
                        type: logType,
                        data: processedData
                    }
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
    } catch (error) {
        console.error('Database logging error:', error.message);
        // Fallback to console logging if database fails
        console.log(`[${new Date().toISOString()}] [${logType}]`, JSON.stringify(logData, null, 2));
    }
}

module.exports = logToDatabase;