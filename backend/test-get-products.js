const http = require('http');

http.get('http://127.0.0.1:5000/api/products/6a0f7efa62c5b09a68e660fe', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      console.log('HTTP Status Code:', res.statusCode);
      console.log('Response Body:', JSON.stringify(JSON.parse(data), null, 2));
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching products:', err.message);
});
