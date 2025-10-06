const Rating = require("../models/rating.model.js");
const productService = require("../services/product.service.js");

async function createRating(reqBody, user) {
  const product = await productService.findProductById(reqBody.productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const rating = new Rating({
    product: product._id,
    user: user._id,
    rating: reqBody.rating,
    createdAt: new Date(),
  });

  return await rating.save();
}

async function getProductsRating(productId) {
  return await Rating.find({ product: productId });
}

module.exports = {
  createRating,
  getProductsRating,
};
