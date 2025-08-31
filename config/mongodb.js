import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log("MongoDB connected");
  });
  await mongoose.connect(process.env.MONGODB_URI)

}

export default connectDB;
// This code connects to a MongoDB database using Mongoose.
// It exports a function `connectDB` that attempts to connect to the database using the URI stored in the environment variable `MONGODB_URI`.
// If the connection is successful, it logs the host of the connected database.