const Wishlist = require('../models/wishlist.model');

async function getWishlist(userId, sortBy = null) {
  const wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: 'items.product',
    populate: [
      { path: 'category', model: 'category' },
      { path: 'subCategory', model: 'subCategory' }
    ]
  });


  if (wishlist && wishlist.items && wishlist.items.length > 0 && sortBy) {
    wishlist.items.sort((a, b) => {
      const priceA = a.product?.price || a.product?.discountedPrice || 0;
      const priceB = b.product?.price || b.product?.discountedPrice || 0;

      switch (sortBy) {
        case 'price-low-to-high':
          return priceA - priceB;
        case 'price-high-to-low':
          return priceB - priceA;
        default:
          return 0;
      }
    });
  }

  return { wishlist, updated: false };
}

async function addToWishlist(userId, productId) {
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = new Wishlist({ user: userId, items: [] });
  }

  const alreadyAdded = wishlist.items.find(item => item.product.toString() === productId);
  if (!alreadyAdded) {
    wishlist.items.push({ product: productId });
    await wishlist.save();
    await wishlist.populate('items.product');
    return { wishlist, updated: true };
  }

  await wishlist.populate('items.product');
  return { wishlist, updated: false };
}

async function removeFromWishlist(userId, productId) {
  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) return { wishlist: null, updated: false };

  const originalLength = wishlist.items.length;
  wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);

  const updated = wishlist.items.length !== originalLength;
  if (updated) {
    await wishlist.save();
  }

  await wishlist.populate('items.product');
  return { wishlist, updated };
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist
};
