const CategoryModel = require('../models/categoryModel');

const categoryService = {
  // Create a new category
  createCategory: async (categoryData) => {
    try {
      if (!categoryData.name || categoryData.name.trim() === '') {
        throw new Error('Category name is required');
      }

      const category = new CategoryModel(categoryData);
      return await category.save();
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  },

  // Get all categories
  getAllCategories: async () => {
    try {
      return await CategoryModel.find({});
    } catch (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      throw new Error(`Error fetching category: ${error.message}`);
    }
  },

  // Update category
  updateCategory: async (categoryId, updateData) => {
    try {
      if (updateData.name !== undefined && updateData.name.trim() === '') {
        throw new Error('Category name cannot be empty');
      }

      const category = await CategoryModel.findByIdAndUpdate(
        categoryId,
        updateData,
        { new: true, runValidators: true }
      );
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    try {
      const category = await CategoryModel.findByIdAndDelete(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
      return category;
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }
};

module.exports = categoryService;
