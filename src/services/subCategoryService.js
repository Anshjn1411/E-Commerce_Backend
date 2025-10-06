const SubCategoryModel = require('../models/subCategory.model');

const subCategoryService = {
  // Create a new subcategory
  createSubCategory: async (subCategoryData) => {
    try {
      const subCategory = new SubCategoryModel(subCategoryData);
      return await subCategory.save();
    } catch (error) {
      throw new Error(`Error creating subcategory: ${error.message}`);
    }
  },

  // Get all subcategories
  getAllSubCategories: async () => {
    try {
      return await SubCategoryModel.find({}).populate('category');
    } catch (error) {
      throw new Error(`Error fetching subcategories: ${error.message}`);
    }
  },

  // Get subcategory by ID
  getSubCategoryById: async (subCategoryId) => {
    try {
      const subCategory = await SubCategoryModel.findById(subCategoryId).populate('category');
      if (!subCategory) {
        throw new Error('SubCategory not found');
      }
      return subCategory;
    } catch (error) {
      throw new Error(`Error fetching subcategory: ${error.message}`);
    }
  },

  // Get subcategories by category ID
  getSubCategoriesByCategory: async (categoryId) => {
    try {
      return await SubCategoryModel.find({ category: categoryId }).populate('category');
    } catch (error) {
      throw new Error(`Error fetching subcategories by category: ${error.message}`);
    }
  },

  // Update subcategory
  updateSubCategory: async (subCategoryId, updateData) => {
    try {
      const subCategory = await SubCategoryModel.findByIdAndUpdate(
        subCategoryId,
        updateData,
        { new: true, runValidators: true }
      ).populate('category');
      if (!subCategory) {
        throw new Error('SubCategory not found');
      }
      return subCategory;
    } catch (error) {
      throw new Error(`Error updating subcategory: ${error.message}`);
    }
  },

  // Delete subcategory
  deleteSubCategory: async (subCategoryId) => {
    try {
      const subCategory = await SubCategoryModel.findByIdAndDelete(subCategoryId);
      if (!subCategory) {
        throw new Error('SubCategory not found');
      }
      return subCategory;
    } catch (error) {
      throw new Error(`Error deleting subcategory: ${error.message}`);
    }
  }
};

module.exports = subCategoryService;