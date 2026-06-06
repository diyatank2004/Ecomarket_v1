const User = require("../models/User");

// ADD TO CART
// before that login with user paste the bearer token and then perform this action
// {{BASE_URL}}/api/cart/add
// {
//   "productId": "69a9c546e024ab6436224121"
// }
const addToCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { productId } = req.body;

    // check if product already exists in cart
    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      // product exists → increase quantity
      user.cart[itemIndex].quantity += 1;
    } else {
      // new product → add to cart
      user.cart.push({ product: productId });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding to cart",
      error: error.message
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");

    res.status(200).json({
      success: true,
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching cart",
      error: error.message
    });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { productId } = req.body;

    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product removed",
      cart: user.cart
    });

  } catch (error) {
    res.status(500).json({
      message: "Error removing product",
      error: error.message
    });
  }
};

module.exports = { addToCart, getCart, removeFromCart };