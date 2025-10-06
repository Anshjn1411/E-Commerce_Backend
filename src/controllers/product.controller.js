const productService = require("../services/product.service");

// Create a new product
async function createProduct(req, res) {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

// Delete a product by ID
async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;
    const message = await productService.deleteProduct(productId);
    return res.status(200).json({ 
      success: true,
      message: message 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

// Update a product by ID
async function updateProduct(req, res) {
  try {
    const productId = req.params.id;
    const product = await productService.updateProduct(productId, req.body);
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

// Find a product by ID
async function findProductById(req, res) {
  try {
    const productId = req.params.id;
    const product = await productService.findProductById(productId,req.user?._id);
    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    return res.status(404).json({ 
      success: false,
      message: err.message 
    });
  }
}

// Get all products with filtering and pagination
async function getAllProducts(req, res) {
  try {
    const reqQuery = req.query;
    const products = await productService.getAllProducts(reqQuery,req.user?._id);
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

// Find products by category
async function getProductsByCategory(req, res) {
  try {
    const categoryId = req.params.categoryId;
    const products = await productService.getProductsByCategory(categoryId);
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

// Find products by subcategory
async function getProductsBySubCategory(req, res) {
  try {
    const subCategoryId = req.params.subCategoryId;
    const products = await productService.getProductsBySubCategory(subCategoryId);
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
}

// Search products by query
async function searchProducts(req, res) {
  try {
    const userId = req.user?.id;
    
    if (!req.query.search) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
         
    const products = await productService.searchProducts(req.query, userId);
    return res.status(200).json({
      success: true,
      data: products
    });
  } catch (err) {
    return res.status(500).json({
       success: false,
       error: err.message
     });
  }
}

// Create multiple products
const createMultipleProduct = async (req, res) => {
  try {
    const products = await productService.createMultipleProduct(req.body);
    return res.status(201).json({ 
      success: true,
      message: "Products created successfully", 
      data: products
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
  getProductsByCategory,
  getProductsBySubCategory,
  searchProducts,
  createMultipleProduct
};
