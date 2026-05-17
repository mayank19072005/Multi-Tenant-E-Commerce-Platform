const fs = require('fs');
const http = require('http');
const jwt = require('jsonwebtoken');

// Generate a valid mock vendor token using the JWT_SECRET from .env
const token = jwt.sign(
  { id: '123456789012345678901234', role: 'vendor', tenant_id: 'tenant123' },
  'super_secret_jwt_key_123',
  { expiresIn: '1h' }
);

// Create a dummy image file
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const dummyImageContent = 'fake image data for testing';
const body = Buffer.concat([
  Buffer.from(`--${boundary}\r\n`),
  Buffer.from('Content-Disposition: form-data; name="image"; filename="test.jpg"\r\n'),
  Buffer.from('Content-Type: image/jpeg\r\n\r\n'),
  Buffer.from(dummyImageContent),
  Buffer.from(`\r\n--${boundary}--\r\n`)
]);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products/upload-image',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': body.length,
    'Authorization': `Bearer ${token}`
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('\n--- RESPONSE FROM SERVER ---');
    try {
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('\n--- ERROR ---');
  console.error(error);
});

req.write(body);
req.end();
