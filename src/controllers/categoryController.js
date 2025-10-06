const categoryService = require('../services/categoryService');

const categoryController = {
  // Create category
  createCategory: async (req, res) => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all categories
  getAllCategories: async (req, res) => {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get category by ID
  getCategoryById: async (req, res) => {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.status(200).json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update category
  updateCategory: async (req, res) => {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete category
  deleteCategory: async (req, res) => {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = categoryController;