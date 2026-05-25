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

    const itemIndex = cart.items.findIndex(
      (item) => item.product_id.toString() === product_id.toString()
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        product_id,
        tenant_id,
        quantity: Number(quantity)
      });
    }

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

const getCart = async (req, res) => {

  try {

    const cart =
      await Cart.findOne({
        customer_id: req.user.id
      }).populate('items.product_id');

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
  addToCart,
  getCart
};