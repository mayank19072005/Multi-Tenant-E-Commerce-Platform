const stripe = require('../config/stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');

const createCheckoutSession = async (req, res) => {
  try {
    const { products } = req.body;

    const productIds = products.map(p => p.product_id || p._id || p.id).filter(Boolean);
    const dbProducts = productIds.length > 0 ? await Product.find({ _id: { $in: productIds } }) : [];

    const line_items = [];
    const orderProducts = [];
    let tenant_id = null;
    let total_amount = 0;

    for (const item of products) {
      const prodId = item.product_id || item._id || item.id;
      const dbProduct = dbProducts.find(p => p._id.toString() === prodId?.toString());
      
      if (dbProduct && dbProduct.stock < item.quantity) {
        return res.status(400).json({
          message: 'Out of stock'
        });
      }

      const title = dbProduct ? dbProduct.title : item.title;
      const price = dbProduct ? dbProduct.price : item.price;
      const tId = dbProduct ? dbProduct.tenant_id : (item.tenant_id || req.user.tenant_id);

      if (!tenant_id && tId) {
        tenant_id = tId;
      }

      total_amount += price * item.quantity;

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: title
          },
          unit_amount: Math.round(price * 100)
        },
        quantity: item.quantity
      });

      orderProducts.push({
        product_id: prodId || null,
        quantity: item.quantity,
        price: price
      });
    }

    if (!tenant_id) {
      tenant_id = req.user.tenant_id || '60c72b2f9b1d8b2e88a8d111'; // mock ObjectId
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      metadata: {
        orderData: JSON.stringify({
          customer_id: req.user.id,
          tenant_id: products[0]?.tenant_id || tenant_id || req.user.tenant_id,
          products: orderProducts,
          total_amount
        })
      },
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel'
    });

    res.json({
      success: true,
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(
      `Webhook Error: ${err.message}`
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    console.log('Payment Successful');

    try {
      const orderData = JSON.parse(session.metadata.orderData);

      const order = await Order.create({
        customer_id: orderData.customer_id,
        tenant_id: orderData.tenant_id,
        products: orderData.products,
        total_amount: orderData.total_amount,
        payment_status: 'paid',
        status: 'pending'
      });

      console.log('Order saved successfully:', order._id);

      // Reduce product stock
      for (const item of order.products) {
        if (item.product_id) {
          await Product.findByIdAndUpdate(
            item.product_id,
            {
              $inc: {
                stock: -item.quantity
              }
            }
          );
        }
      }
    } catch (error) {
      console.error('Error saving order:', error.message);
    }
  }

  res.json({ received: true });
};

const getOrders = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query = { customer_id: req.user.id };
    } else if (req.user.role === 'vendor') {
      query = { tenant_id: req.user.tenant_id };
    } else if (req.user.role === 'admin') {
      if (req.user.tenant_id) {
        query = { tenant_id: req.user.tenant_id };
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access Denied'
      });
    }

    const orders = await Order.find(query)
      .populate('customer_id', 'name email')
      .populate('products.product_id')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Only vendors and admins can update order status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Authorize vendor to only update orders belonging to their tenant
    if (req.user.role === 'vendor' && order.tenant_id.toString() !== req.user.tenant_id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: Order belongs to a different tenant'
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getMyOrders = async (
  req,
  res
) => {
  try {
    const orders =
      await Order.find({
        customer_id: req.user.id
      })
      .populate('products.product_id')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  createCheckoutSession,
  webhookHandler,
  getOrders,
  updateOrderStatus,
  getMyOrders
};