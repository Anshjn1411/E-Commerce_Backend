const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

// Create a new subcategory
router.post('/', subCategoryController.createSubCategory);

// Get all subcategories
router.get('/', subCategoryController.getAllSubCategories);

// Get a specific subcategory by ID
router.get('/:id', subCategoryController.getSubCategoryById);

// Get subcategories by category ID
router.get('/category/:categoryId', subCategoryController.getSubCategoriesByCategory);

// Update a subcategory
router.put('/:id', subCategoryController.updateSubCategory);

// Delete a subcategory
router.delete('/:id', subCategoryController.deleteSubCategory);

module.exports = router;