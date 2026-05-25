const fs = require('fs');
const path = require('path');

const email = 'testcustomer@example.com';

async function run() {
  try {
    console.log('1. Sending OTP to ' + email + '...');
    const sendOtpRes = await fetch(`http://127.0.0.1:5000/api/auth/send-otp?email=${encodeURIComponent(email)}`);
    const sendOtpData = await sendOtpRes.json();
    console.log('Send OTP response:', sendOtpData);

    // Wait a bit for the file to write
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Read the OTP from .otp_debug
    const otpPath = path.join(__dirname, '.otp_debug');
    if (!fs.existsSync(otpPath)) {
      throw new Error('.otp_debug file not found');
    }
    const otp = fs.readFileSync(otpPath, 'utf8').trim();
    console.log('2. Read OTP from .otp_debug:', otp);

    // Verify OTP
    console.log('3. Verifying OTP...');
    const verifyRes = await fetch('http://127.0.0.1:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        otp,
        name: 'Test Customer'
      })
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      throw new Error('Verification failed: ' + JSON.stringify(verifyData));
    }
    const token = verifyData.token;
    console.log('Login successful. JWT Token:', token);

    // Create Checkout Session
    console.log('4. Creating Stripe Checkout Session...');
    const checkoutRes = await fetch('http://127.0.0.1:5000/api/orders/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        products: [
          {
            title: 'Stripe Test Product',
            price: 50.00,
            quantity: 2
          }
        ]
      })
    });
    const checkoutData = await checkoutRes.json();
    console.log('Checkout Response:', checkoutData);
    if (checkoutData.success && checkoutData.url) {
      console.log('\nSUCCESS! Stripe Checkout URL:');
      console.log(checkoutData.url);
      console.log('\nOpening the URL in your default browser...');
      
      // Open in browser based on OS (Windows)
      const { exec } = require('child_process');
      exec(`start "" "${checkoutData.url}"`);
    } else {
      console.error('Failed to get checkout URL', checkoutData);
    }
  } catch (error) {
    console.error('Error during checkout test:', error);
  }
}

run();
