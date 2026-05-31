const Order = require("../models/Order");

exports.updateOrderStatus = async (
  req,
  res
) => {

  try {

    const { status } = req.body;

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {

      return res.status(404).json({
        message: "Order not found"
      });

    }

    order.status = status;

    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      order
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
