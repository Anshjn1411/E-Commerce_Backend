const CategoryModel = require("../models/categoryModel");
const SubCategoryModel = require("../models/subCategory.model");
const Product = require("../models/product.model");
const Wishlist = require("../models/wishlist.model");

async function markWishlisted(products, userId = null) {
  if (!userId) {
    return products.map(p => ({ ...p, isWishlisted: false }));
  }

  const wishlist = await Wishlist.findOne({ user: userId });
  const wishlistedIds = new Set((wishlist?.items || []).map(item => item.product.toString()));

  return products.map(p => ({
    ...p,
    isWishlisted: wishlistedIds.has(p._id.toString())
  }));
}


// Create a new product
async function createProduct(reqData) {
  try {
    let category = null;
    if (reqData.category) {
      category = await CategoryModel.findById(reqData.category);
    }

    let subCategory = null;
    if (reqData.subCategory && category) {
      subCategory = await SubCategoryModel.findById(reqData.subCategory);
      if (subCategory && !subCategory.category.includes(category._id)) {
        throw new Error("Subcategory does not belong to the selected category");
      }
    }

    const product = new Product({
      title: reqData.title,
      color: reqData.color,
      description: reqData.description,
      discountedPrice: reqData.discountedPrice,
      discountPersent: reqData.discountPersent,
      imageUrl: reqData.imageUrl,
      brand: reqData.brand,
      price: reqData.price,
      sizes: reqData.sizes,
      quantity: reqData.quantity,
      category: category ? category._id : null,
      subCategory: subCategory ? subCategory._id : null,
    });

    const savedProduct = await product.save();
    return savedProduct;
  } catch (error) {
    throw new Error(`Error creating product: ${error.message}`);
  }
}

// Delete a product by ID
async function deleteProduct(productId) {
  try {
    const product = await findProductById(productId);

    if (!product) {
      throw new Error(`Product not found with id: ${productId}`);
    }

    await Product.findByIdAndDelete(productId);
    return "Product deleted successfully";

  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
}

// Update a product by ID
async function updateProduct(productId, reqData) {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      reqData,
      { new: true, runValidators: true }
    ).populate('category').populate('subCategory');

    if (!updatedProduct) {
      throw new Error(`Product not found with id: ${productId}`);
    }

    return updatedProduct;

  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
}

// Find a product by ID
async function findProductById(id,userId) {
  try {
    const product = await Product.findById(id)
      .populate("category")
      .populate("subCategory")
      .populate("ratings")
      .populate("reviews")
      .exec();

    if (!product) {
      throw new Error(`Product not found with id: ${id}`);
    }

    const productWithWishlist = await markWishlisted([product.toObject()], userId);
    return productWithWishlist[0];

  } catch (error) {
    throw new Error(`Error finding product: ${error.message}`);
  }
}

// Get all products with filtering and pagination
async function getAllProducts(reqQuery,userId) {
  try {
    let {
      category,
      subCategory,
      color,
      sizes,
      minPrice,
      maxPrice,
      minDiscount,
      sort,
      stock,
      pageNumber,
      pageSize,
      brand
    } = reqQuery;

    // Parse and validate pagination parameters
    pageSize = Math.min(Math.max(parseInt(pageSize) || 10, 1), 100);
    pageNumber = Math.max(parseInt(pageNumber) || 0, 0);

    // Parse price filters
    const min = Math.max(parseFloat(minPrice) || 0, 0);
    const max = parseFloat(maxPrice) || 100000;
    const minDiscountValue = Math.max(parseFloat(minDiscount) || 0, 0);

    // Base query with population
    let query = Product.find()
      .populate("category", "name _id")
      .populate("subCategory", "name _id");

    // Apply filters only if values exist and are valid
    if (category && category.trim() && category !== "undefined") {
      query = query.where("category").equals(category.trim());
    }

    if (subCategory && subCategory.trim() && subCategory !== "undefined") {
      query = query.where("subCategory").equals(subCategory.trim());
    }

    if (brand && brand.trim()) {
      query = query.where("brand").regex(new RegExp(brand.trim(), "i"));
    }

    // Color filter
    if (color && color.trim()) {
      const colors = color.split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (colors.length > 0) {
        const colorRegex = new RegExp(colors.join("|"), "i");
        query = query.where("color").regex(colorRegex);
      }
    }

    // Size filter
    if (sizes && sizes.trim()) {
      const sizeArray = sizes.split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (sizeArray.length > 0) {
        query = query.where("sizes.name").in(sizeArray);
      }
    }

    // Price range filter
    if (min >= 0 && max > min) {
      query = query.where("discountedPrice").gte(min).lte(max);
    }

    // Discount filter
    if (minDiscountValue > 0) {
      query = query.where("discountPersent").gte(minDiscountValue);
    }

    // Stock filter
    if (stock && stock.trim()) {
      const stockFilter = stock.trim().toLowerCase();
      if (stockFilter === "in_stock") {
        query = query.where("quantity").gt(0);
      } else if (stockFilter === "out_of_stock") {
        query = query.where("quantity").lte(0);
      }
    }

    // Sorting
    const sortOption = sort || "newest";
    switch (sortOption) {
      case "price_high":
        query = query.sort({ discountedPrice: -1 });
        break;
      case "price_low":
        query = query.sort({ discountedPrice: 1 });
        break;
      case "newest":
        query = query.sort({ createdAt: -1 });
        break;
      case "oldest":
        query = query.sort({ createdAt: 1 });
        break;
      case "rating":
        query = query.sort({ avgRating: -1, numRatings: -1 });
        break;
      case "name_asc":
        query = query.sort({ title: 1 });
        break;
      case "name_desc":
        query = query.sort({ title: -1 });
        break;
      default:
        query = query.sort({ createdAt: -1 });
    }

    // Get total count before pagination
    const totalProducts = await query.clone().countDocuments();

    // Apply pagination
    const skip = pageNumber * pageSize;

    let products = await query.skip(skip).limit(pageSize).lean().exec();
    products = await markWishlisted(products,userId);

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / pageSize);

    return {
      content: products,
      currentPage: pageNumber,
      totalPages,
      totalProducts,
      pageSize,
      hasNextPage: (pageNumber + 1) < totalPages,
      hasPrevPage: pageNumber > 0
    };

  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    throw new Error(`Error fetching products: ${error.message}`);
  }
}

// Create multiple products
async function createMultipleProduct(products) {
  try {
    const createdProducts = [];

    for (let productData of products) {
      const product = await createProduct(productData);
      createdProducts.push(product);
    }

    return createdProducts;

  } catch (error) {
    throw new Error(`Error creating multiple products: ${error.message}`);
  }
}

// Get products by category
async function getProductsByCategory(categoryId,userId) {
  try {
    const products = await Product.find({ category: categoryId })
      .populate("category")
      .populate("subCategory")
      .exec();

    const result = await markWishlisted(products.map(p => p.toObject()), userId);
    return result;


  } catch (error) {
    throw new Error(`Error fetching products by category: ${error.message}`);
  }
}

// Get products by subcategory
async function getProductsBySubCategory(subCategoryId,userId) {
  try {
    const products = await Product.find({ subCategory: subCategoryId })
      .populate("category")
      .populate("subCategory")
      .exec();

    const result = await markWishlisted(products.map(p => p.toObject()), userId);
    return result;

  } catch (error) {
    throw new Error(`Error fetching products by subcategory: ${error.message}`);
  }
}

// Search products by title or description
async function searchProducts(reqQuery, userId) {
  try {
    let {
      search,
      color,
      sizes,
      minPrice,
      maxPrice,
      minDiscount,
      sort,
      stock,
      pageNumber,
      pageSize,
      brand
    } = reqQuery;

    // Parse and validate pagination parameters
    pageSize = Math.min(Math.max(parseInt(pageSize) || 10, 1), 100);
    pageNumber = Math.max(parseInt(pageNumber) || 0, 0);

    // Parse price filters
    const min = Math.max(parseFloat(minPrice) || 0, 0);
    const max = parseFloat(maxPrice) || 100000;
    const minDiscountValue = Math.max(parseFloat(minDiscount) || 0, 0);

    // Base search query
    const searchRegex = new RegExp(search, "i");
    let query = Product.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { brand: { $regex: searchRegex } }
      ]
    }).populate("category", "name _id").populate("subCategory", "name _id");

    // Apply filters
    if (brand && brand.trim()) {
      query = query.where("brand").regex(new RegExp(brand.trim(), "i"));
    }

    // Color filter
    if (color && color.trim()) {
      const colors = color.split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (colors.length > 0) {
        const colorRegex = new RegExp(colors.join("|"), "i");
        query = query.where("color").regex(colorRegex);
      }
    }

    // Size filter
    if (sizes && sizes.trim()) {
      const sizeArray = sizes.split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      if (sizeArray.length > 0) {
        query = query.where("sizes.name").in(sizeArray);
      }
    }

    // Price range filter
    if (min >= 0 && max > min) {
      query = query.where("discountedPrice").gte(min).lte(max);
    }

    // Discount filter
    if (minDiscountValue > 0) {
      query = query.where("discountPersent").gte(minDiscountValue);
    }

    // Stock filter
    if (stock && stock.trim()) {
      const stockFilter = stock.trim().toLowerCase();
      if (stockFilter === "in_stock") {
        query = query.where("quantity").gt(0);
      } else if (stockFilter === "out_of_stock") {
        query = query.where("quantity").lte(0);
      }
    }

    // Sorting
    const sortOption = sort || "newest";
    switch (sortOption) {
      case "price_high":
        query = query.sort({ discountedPrice: -1 });
        break;
      case "price_low":
        query = query.sort({ discountedPrice: 1 });
        break;
      case "newest":
        query = query.sort({ createdAt: -1 });
        break;
      case "oldest":
        query = query.sort({ createdAt: 1 });
        break;
      case "rating":
        query = query.sort({ avgRating: -1, numRatings: -1 });
        break;
      case "name_asc":
        query = query.sort({ title: 1 });
        break;
      case "name_desc":
        query = query.sort({ title: -1 });
        break;
      default:
        query = query.sort({ createdAt: -1 });
    }

    // Get total count before pagination
    const totalProducts = await query.clone().countDocuments();

    // Apply pagination
    const skip = pageNumber * pageSize;

    let products = await query.skip(skip).limit(pageSize).lean().exec();
    products = await markWishlisted(products, userId);

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / pageSize);

    return {
      content: products,
      currentPage: pageNumber,
      totalPages,
      totalProducts,
      pageSize,
      hasNextPage: (pageNumber + 1) < totalPages,
      hasPrevPage: pageNumber > 0
    };

  } catch (error) {
    console.error(`Error searching products: ${error.message}`);
    throw new Error(`Error searching products: ${error.message}`);
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  findProductById,
  createMultipleProduct,
  getProductsByCategory,
  getProductsBySubCategory,
  searchProducts
};