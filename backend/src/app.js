const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(helmet());

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

app.use(express.json());

const testRoutes = require('./routes/testRoutes');

app.use('/api/test', testRoutes);

app.get('/', (req, res) => {
  res.send('API Running Successfully');
});

const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');

app.use('/api/users', userRoutes);  

const protectedRoutes = require('./routes/protectedRoutes');

app.use('/api/protected', protectedRoutes);

const vendorRoutes = require('./routes/vendorRoutes');

app.use('/api/vendors', vendorRoutes);

const adminRoutes = require('./routes/adminRoutes');

app.use('/api/admin', adminRoutes);

const productRoutes = require('./routes/productRoutes');

app.use('/api/products', productRoutes);

const categoryRoutes = require('./routes/categoryRoutes');

app.use('/api/categories', categoryRoutes);

const cartRoutes = require('./routes/cartRoutes');

app.use('/api/cart', cartRoutes);

module.exports = app;