const Order = require("../models/Order");
const { errorHandler } = require("../auth");

module.exports.createOrder = async (req, res) => {
  const { userId, productsOrdered, totalPrice } = req.body;

  if (!userId || !productsOrdered || !totalPrice) {
      return res.status(400).send({
          message: "UserId, productsOrdered, and totalPrice are required",
      });
  }

  if (productsOrdered.length === 0) {
      return res.status(400).send({ message: "No items to checkout" });
  }

  try {
      // Check if an order already exists for the user
      const existingOrder = await Order.findOne({ userId: userId });

      if (existingOrder) {
          // Update the existing order with new items
          existingOrder.productsOrdered = productsOrdered;
          existingOrder.totalPrice = totalPrice;
          const updatedOrder = await existingOrder.save();

          return res.status(200).send({
              message: "Order updated successfully",
              orderId: updatedOrder._id
          });
      }

      // Create and save the new order
      const newOrder = new Order({
          userId: userId,
          productsOrdered: productsOrdered,
          totalPrice: totalPrice,
      });

      const result = await newOrder.save();
      res.status(201).send({
          message: "Order created successfully",
          orderId: result._id
      });
  } catch (err) {
      return res.status(500).send({
          message: "An error occurred while creating or updating the order",
          error: err.message
      });
  }
};


module.exports.retrieveAllOrder = async (req, res) => {
  return await Order.find({}).then((order) => {
    if (!order) {
      return res.status(404).send({ message: "No Orders Found" });
    } else {
      return res.status(200).send({ orders: order });
    }
  });
};

module.exports.retrieveMyOrder = async (req, res) => {
  return await Order.findOne({ userId: req.user.id })
    .then((order) => {
      if (!order) {
        return res.status(404).send({ message: "No Orders Found" });
      } else {
        return res.status(200).send({ orders: order });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};
