const express = require("express");
const router = express.Router();

const { createProduct,getAllProducts,searchProducts,updateProduct,deleteProduct,getProductById, } = require("../controllers/productController");
const { protect,adminOnly } = require("../middleware/authMiddleware");

router.post("/create", protect,adminOnly, createProduct);
router.get("/getall", getAllProducts);
router.get("/search", searchProducts);
router.put("/update/:id", protect, adminOnly, updateProduct);
router.delete("/delete/:id", protect, adminOnly, deleteProduct);
router.get("/:id", getProductById);

module.exports = router;