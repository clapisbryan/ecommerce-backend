const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");


// Import routes
const userRoutes = require("./routes/user.js");

const productRoutes = require("./routes/product");

const cartRoutes = require("./routes/cart");

const orderRoutes = require("./routes/order");

const app = express();

require("dotenv").config();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: [
    "http://localhost:5173/",
    "https://ecommerce-frontend-theta-three.vercel.app/",
    "https://ecommerce-frontend-git-master-bryans-projects-7acc38e5.vercel.app/",
    "https://ecommerce-frontend-b8ydt2n82-bryans-projects-7acc38e5.vercel.app/"
  ],
  // Allow only the specified HTTP methods
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  // Allow only the specified headers
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () =>
  console.log("Now connected to MongoDB Atlas")
);

// [SECTION] Add your routes here
app.use("users", userRoutes);
app.use("products", productRoutes);
app.use("cart", cartRoutes);
app.use("orders", orderRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server was connected: ${process.env.PORT}`);
});