const mongoose = require('mongoose');


const urlSchema = new mongoose.Schema({
    telegramId: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20,
    },
    first_name: {
        type: String,
        require: false
    },
    last_name: {
        type: String,
        require: false
    },
    phone: {
        type: String,
        require: false
    },
    mobile: {
        type: String,
        require: false
    },
    nationalCode: {
        type: String,
        require: false
    },
    gender: {
        type: String,
        require: false
    },
    birthDay: {
        type: String,
        require: false
    },
    cityName: {
        type: String,
        require: false
    },
    stateName: {
        type: String,
        require: false
    },
    addressFullName: {
        type: String,
        require: false
    },
    address: {
        type: String,
        require: false
    },
    postalCode: {
        type: String,
        require: false
    },
    addressMobile: {
        type: String,
        require: false
    },
    addressLatitude: {
        type: String,
        require: false
    },
    addressLongitude: {
        type: String,
        require: false
    },
    link: {
        type: String,
        require: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isWorked: {
        type: Boolean,
        default: false
    },
    cookies: {
        type: String,
        require: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


urlSchema.pre(/^find/, function(next) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    // Update isActive based on creation time
    this.where({ 
        $or: [
            { createdAt: { $gt: twentyFourHoursAgo } },
            { isActive: false } // Keep already inactive ones
        ]
    });
    
    next();
});

// Add instance method to check if expired
urlSchema.methods.isExpired = function() {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    return this.createdAt < twentyFourHoursAgo;
};

const Url = mongoose.model('Url', urlSchema);

module.exports = Url;