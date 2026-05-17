const Cart = require('../models/Cart');

const addToCart = async (req, res) => {
  try {

    const {
      product_id,
      tenant_id,
      quantity
    } = req.body;

    let cart = await Cart.findOne({
      customer_id: req.user.id
    });

    if (!cart) {

      cart = await Cart.create({
        customer_id: req.user.id,
        items: []
      });

    }

    cart.items.push({
      product_id,
      tenant_id,
      quantity
    });

    await cart.save();

    res.json({
      success: true,
      cart
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

module.exports = {
  addToCart
};