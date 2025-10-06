const mongoose = require("mongoose")

const mongoDbUrl='mongodb+srv://ashutosh272006:yUxuzEUzpsOXhh98@cluster0.gsxvglf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const connectDb=()=>{
    return mongoose.connect(mongoDbUrl)
}

module.exports={connectDb}