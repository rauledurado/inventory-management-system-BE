const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.LOCAL_MONGODB_URI, {
    useUnifiedTopology: true,
  });

  console.log(`MongoDB connected ${conn.connection.host}`);
};

module.exports = connectDB;
