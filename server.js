import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
//App configuration
const PORT = process.env.PORT || 5000;
const app = express();
//Database connection
connectDB();

//Cloudinary configuration
connectCloudinary();

//Middleware
app.use(cors());
app.use(express.json());

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API working...");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
