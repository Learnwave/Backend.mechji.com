import mongoose from "mongoose";

export const connectDb = async () => {
    await mongoose.connect("mongodb://localhost:27017/AppUsers").then(()=>console.log("db Connected successfully"))
}



//mongodb://localhost:27017/