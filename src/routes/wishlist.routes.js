const express = require('express');
const router = express.Router();
const authenticate = require("../middleware/authenticat.js");
const wishlistService = require('../services/wishlist.service');

router.use(authenticate);

// Get wishlist
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { sortBy } = req.query; // Get sort parameter from query string
    
    const wishlist = await wishlistService.getWishlist(userId, sortBy);
    res.status(200).json({ success: true, updated: false, data: wishlist });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      updated: false, 
      message: "Failed to fetch wishlist", 
      error: error.message 
    });
  }
});

// Add to wishlist
router.post('/add/:productId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { wishlist, updated } = await wishlistService.addToWishlist(userId, productId); // updated expected from service
    res.status(201).json({
      success: true,
      updated,
      message: updated ? "Product added to wishlist" : "Product already in wishlist",
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, updated: false, message: "Failed to add product", error: error.message });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;
    const { wishlist, updated } = await wishlistService.removeFromWishlist(userId, productId); // updated expected from service
    res.status(200).json({
      success: true,
      updated,
      message: updated ? "Product removed from wishlist" : "Product was not in wishlist",
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({ success: false, updated: false, message: "Failed to remove product", error: error.message });
  }
});

module.exports = router;
