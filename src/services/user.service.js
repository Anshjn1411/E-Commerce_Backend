const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.model.js');
const jwtProvider=require("../config/jwtProvider")
const Address = require('../models/address.model.js'); 
const Cart = require('../models/cart.model.js');
const CartItem = require('../models/cartItem.model.js');
const Order = require('../models/order.model.js');
const OrderItem = require('../models/orderItems.js');
const Wishlist = require('../models/wishlist.model.js');
const Review = require('../models/review.model.js'); 
const Rating = require('../models/rating.model.js');

const createUser = async (userData) => {
    try {
        let { firstName, lastName, email = "", password, role, mobile, dob } = userData;

        const isUserExist = await User.findOne({  mobile });

        if (isUserExist) {
            throw new Error(`User already exists with mobile`);
        }

        // Hash password only if it's provided
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 8);
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            mobile,
            dob 
        });

        console.log("User created:", user);

        return user;
    } catch (error) {
        console.log("Create User Error -", error.message);
        throw new Error(error.message);
    }
};

const findUserById=async(userId)=>{
    try {
        const user = await User.findById(userId);
        if(!user){
            throw new Error("user not found with id : ",userId)
        }
        return user;
    } catch (error) {
        console.log("error :------- ",error.message)
        throw new Error(error.message)
    }
}

const getUserByEmail=async(email)=>{
    try {

        const user=await User.findOne({email});

        if(!user){
            throw new Error("user found with email : ",email)
        }

        return user;
        
    } catch (error) {
        console.log("error - ",error.message)
        throw new Error(error.message)
    }
}

const getUserByMobile = async (mobile) => {
    try {
        const user = await User.findOne({ mobile });

        // Instead of throwing, just return null
        return user || null;

    } catch (error) {
        console.log("Error -", error.message);
        throw new Error(error.message);
    }
}

const getUserProfileByToken=async(token)=>{
    try {

        const userId=jwtProvider.getUserIdFromToken(token)

        // console.log("userr id ",userId)


        const user= (await findUserById(userId)).populate("addresses");
        user.password=null;
        
        if(!user){
            throw new Error("user not exist with id : ",userId)
        }
        return user;
    } catch (error) {
        console.log("error ----- ",error.message)
        throw new Error(error.message)
    }
}

const getAllUsers=async()=>{
    try {
        const users=await User.find();
        return users;
    } catch (error) {
        console.log("error - ",error)
        throw new Error(error.message)
    }
}

const updateUser = async (userId, updateData) => {
    try {
        const { firstName, lastName, email, password, role, mobile, dob } = updateData;
        
        // Check if user exists
        const existingUser = await User.findById(userId);
        if (!existingUser) {
            throw new Error(`User not found with id: ${userId}`);
        }
        
        // If mobile is being updated, check if it's already taken by another user
        if (mobile && mobile !== existingUser.mobile) {
            const userWithMobile = await User.findOne({ mobile, _id: { $ne: userId } });
            if (userWithMobile) {
                throw new Error(`Mobile number ${mobile} is already registered with another user`);
            }
        }
        
        // If email is being updated, check if it's already taken by another user
        if (email && email !== existingUser.email) {
            const userWithEmail = await User.findOne({ email, _id: { $ne: userId } });
            if (userWithEmail) {
                throw new Error(`Email ${email} is already registered with another user`);
            }
        }
        
        // Prepare update object
        const updateObject = {};
        if (firstName !== undefined) updateObject.firstName = firstName;
        if (lastName !== undefined) updateObject.lastName = lastName;
        if (email !== undefined) updateObject.email = email;
        if (role !== undefined) updateObject.role = role;
        if (mobile !== undefined) updateObject.mobile = mobile;
        if (dob !== undefined) updateObject.dob = dob;
        
        // Hash password if provided
        if (password) {
            updateObject.password = await bcrypt.hash(password, 8);
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateObject,
            { new: true, runValidators: true }
        );
        
        return updatedUser;
        
    } catch (error) {
        console.log("Update User Error -", error.message);
        throw new Error(error.message);
    }
};

const deleteUser = async (userId) => {
    try {
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error(`User not found with id: ${userId}`);
        }
        
        // Delete all related data in the correct order to avoid reference errors
        
        // 1. Delete Cart Items first (as they reference cart)
        const cartItems = await CartItem.deleteMany({ userId: userId });
        
        // 2. Delete Cart (field name is 'user' not 'userId')
        const cart = await Cart.deleteMany({ user: userId });
        
        // 3. Delete Order Items (they use 'userId' field directly)
        const orderItems = await OrderItem.deleteMany({ userId: userId });
        
        // 4. Delete Orders (field name is 'user' not 'userId')
        const deletedOrders = await Order.deleteMany({ user: userId });
        
        // 5. Delete Addresses (this seems correct as 'userId')
        const addresses = await Address.deleteMany({ userId: userId });
        
        // 6. Delete Wishlist items
        const wishlist = await Wishlist.deleteMany({ userId: userId });
        
        // 7. Delete Reviews (if user has written any)
        const reviews = await Review.deleteMany({ userId: userId });
        
        // 8. Delete Ratings (if user has given any)
        const ratings = await Rating.deleteMany({ userId: userId });
        
        // 9. Finally delete the user
        const deletedUser = await User.findByIdAndDelete(userId);
        
        return {
            message: "User and all related data deleted successfully",
            deletedUser: deletedUser,
            deletedRelatedData: {
                cartItems: cartItems.deletedCount,
                carts: cart.deletedCount,
                orders: deletedOrders.deletedCount,
                orderItems: orderItems.deletedCount,
                addresses: addresses.deletedCount,
                wishlistItems: wishlist.deletedCount,
                reviews: reviews.deletedCount,
                ratings: ratings.deletedCount
            }
        };
        
    } catch (error) {
        console.log("Delete User Error -", error.message);
        throw new Error(error.message);
    }
};

const updateRefreshToken = async (userId, refreshToken) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { refreshToken: refreshToken },
            { new: true }
        );
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports={
    createUser,
    findUserById,
    getUserProfileByToken,
    getUserByEmail,
    getUserByMobile,
    getAllUsers,
    updateUser,
    deleteUser,
    updateRefreshToken
}