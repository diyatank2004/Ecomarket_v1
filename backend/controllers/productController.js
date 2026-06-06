const Product = require("../models/Product");

// Create product :
// https://localhost:5000/api/products/create
// {
//  "name": "Eco Bag",
//  "price": 99,
//  "description": "Reusable eco-friendly Bag",
//  "category": "Eco Products",
//  "image": "image-url",
//  "rating": 4.3
// }

// For admin :
// "email": "diya@ecomarket.com",
// "password": "Eco@2004",
const createProduct = async (req, res) => {
  try {

    const { name, description, price, category, image, stock } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      stock
    });

    const savedProduct = await product.save();

    res.status(201).json({
      message: "Product created",
      product: savedProduct
    });

  } catch (error) {

    res.status(500).json({
      message: "Error creating product",
      error: error.message
    });

  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products.length) {
      return res.status(404).json({
        message: "No products found"
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving products",
      error: error.message
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving product",
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    } 
    res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product: updatedProduct
  }); 
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
};

// get {{BASE_URL}}/api/products/search?query=bottle
const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
    if (!query) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message
    });
  }
};

const productController = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts
};

module.exports = productController;