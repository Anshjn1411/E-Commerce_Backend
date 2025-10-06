const { app } = require(".");
const { connectDb } = require("./config/db");

const PORT=5454;
app.listen(PORT,"0.0.0.0",async ()=>{
    await connectDb()
    console.log("ecommerce api listing on port ",PORT)
})
