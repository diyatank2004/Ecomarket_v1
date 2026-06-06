const User = require("../models/User");

const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { productId } = req.body;

    // check if already exists
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        message: "Product already in wishlist"
      });
    }

    user.wishlist.push(productId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Added to wishlist",
      wishlist: user.wishlist
    });

  } catch (error) {
    res.status(500).json({
      message: "Error adding to wishlist",
      error: error.message
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");

    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching wishlist",
      error: error.message
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { productId } = req.body;

    user.wishlist = user.wishlist.filter(
      item => item.toString() !== productId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Removed from wishlist",
      wishlist: user.wishlist
    });

  } catch (error) {
    res.status(500).json({
      message: "Error removing from wishlist",
      error: error.message
    });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };