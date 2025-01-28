import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log(`Database connection established successfully`);
  } catch (error) {
    console.log(`An error occurred while connecting to the database`);
  }
};

export default connectDB;
