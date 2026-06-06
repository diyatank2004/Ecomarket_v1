const Order = require("../models/Order");
const User = require("../models/User");

const placeOrder = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");

    if (!user.cart.length) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    // calculate total
    let total = 0;

    const orderItems = user.cart.map(item => {
      total += item.product.price * item.quantity;

      return {
        product: item.product._id,
        quantity: item.quantity
      };
    });

    // create order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      totalPrice: total
    });

    // clear cart
    user.cart = [];
    await user.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(500).json({
      message: "Error placing order",
      error: error.message
    });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("orderItems.product");

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message
    });
  }
};

module.exports = {
  placeOrder,
  getMyOrders
};