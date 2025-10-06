const subCategoryService = require('../services/subCategoryService');

const subCategoryController = {
  // Create subcategory
  createSubCategory: async (req, res) => {
    try {
      const subCategory = await subCategoryService.createSubCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'SubCategory created successfully',
        data: subCategory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get all subcategories
  getAllSubCategories: async (req, res) => {
    try {
      const subCategories = await subCategoryService.getAllSubCategories();
      res.status(200).json({
        success: true,
        data: subCategories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get subcategory by ID
  getSubCategoryById: async (req, res) => {
    try {
      const subCategory = await subCategoryService.getSubCategoryById(req.params.id);
      res.status(200).json({
        success: true,
        data: subCategory
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get subcategories by category
  getSubCategoriesByCategory: async (req, res) => {
    try {
      const subCategories = await subCategoryService.getSubCategoriesByCategory(req.params.categoryId);
      res.status(200).json({
        success: true,
        data: subCategories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Update subcategory
  updateSubCategory: async (req, res) => {
    try {
      const subCategory = await subCategoryService.updateSubCategory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'SubCategory updated successfully',
        data: subCategory
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // Delete subcategory
  deleteSubCategory: async (req, res) => {
    try {
      await subCategoryService.deleteSubCategory(req.params.id);
      res.status(200).json({
        success: true,
        message: 'SubCategory deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = subCategoryController;