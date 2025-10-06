const express=require("express")
const cors=require('cors');

const app=express();

app.use(express.json())

app.use(
  cors({
    origin: "*", 
    credentials: true,
  })
);

app.get("/",(req,res)=>{
    return res.status(200).send({message:"welcome to ecommerce api - node"})
})

const authRouter=require("./routes/auth.routes.js")
app.use("/auth",authRouter)

const userRouter=require("./routes/user.routes.js");
app.use("/api/users",userRouter)

const addressRouter = require("./routes/address.routes.js");
app.use("/api/addresses", addressRouter);

const productRouter=require("./routes/product.routes.js");
app.use("/api/products",productRouter);

const adminProductRouter=require("./routes/product.admin.routes.js");
app.use("/api/admin/products",adminProductRouter);

const cartRouter=require("./routes/cart.routes.js");
app.use("/api/cart", cartRouter);

app.use('/api/wishlist', require('./routes/wishlist.routes'));

const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);

const cartItemRouter=require("./routes/cartItem.routes.js")
app.use("/api/cart_items",cartItemRouter);

const orderRouter=require("./routes/order.routes.js");
app.use("/api/orders",orderRouter);

const paymentRouter=require("./routes/payment.routes.js");
app.use('/api/payments',paymentRouter)

const reviewRouter=require("./routes/review.routes.js");
app.use("/api/reviews",reviewRouter);

const ratingRouter=require("./routes/rating.routes.js");
app.use("/api/ratings",ratingRouter);

// admin routes handler
const adminOrderRoutes=require("./routes/adminOrder.routes.js");
app.use("/api/admin/orders",adminOrderRoutes);

module.exports={app};