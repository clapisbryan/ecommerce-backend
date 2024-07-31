const Cart = require("../models/Cart");
const { errorHandler } = require("../auth");

module.exports.getCartItems = (req, res) => {
  console.log("req.user.id", req.user.id);
  return Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ message: "User Not Found" });
      }
      return res.status(200).send(cart);
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.addToCart = async (req, res) => {
  const userId = req.user.id; // get id of authenticated user
  const { cartItems, totalPrice } = req.body;

  return await Cart.findOne({ userId: userId }) // find a cart of user
    .then((cart) => {
      // If cart does not exist, create a new one
      if (!cart) {
        let newCart = new Cart({
          userId: userId,
          cartItems: cartItems,
          totalPrice: totalPrice,
        });

        return newCart
          .save()
          .then((item) => {
            return res.status(201).send({
              message: "Item added to cart successfully",
              cart: item,
            });
          })
          .catch((error) => errorHandler(error, req, res));
      } else {
        // Cart exists, merge cartItems and update totalPrice
        cartItems.forEach((newItem) => {
          let existingItem = cart.cartItems.find(
            (item) => item.productId === newItem.productId
          );
          if (existingItem) {
            // Update existing item
            existingItem.quantity += newItem.quantity;
            existingItem.subtotal += newItem.subtotal;
          } else {
            // Add new item to cartItems
            cart.cartItems.push(newItem);
          }
        });

        // Update totalPrice
        cart.totalPrice += totalPrice;

        // Save updated cart
        return cart
          .save()
          .then((savedCart) => {
            return res.status(200).send({
              message: "Item added to cart successfully",
              cart: savedCart,
            });
          })
          .catch((error) => errorHandler(error, req, res));
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.changeProductQuantity = async (req, res) => {
  try {
    const { cartItems, totalPrice } = req.body;

    if (!Array.isArray(cartItems) || totalPrice == null) {
      return res.status(400).send({
        message: "Invalid data format: cartItems should be an array and totalPrice is required",
      });
    }

    const totalPriceFloat = parseFloat(totalPrice);
    if (isNaN(totalPriceFloat)) {
      return res.status(400).send({ message: "Invalid totalPrice value" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).send({ message: "Cart not found" });
    }

    // Update each item in cartItems array
    cartItems.forEach((newItem) => {
      const { productId, quantity, subtotal } = newItem;

      if (!productId || quantity == null || subtotal == null) {
        throw new Error(
          "Invalid cart item data: productId, quantity, and subtotal are required"
        );
      }

      // Find the item in cart or create a new one if not found
      const existingItem = cart.cartItems.find(item => item.productId === productId);

      if (existingItem) {
        // Update existing item
        existingItem.quantity = quantity;
        existingItem.subtotal = subtotal;
      } else {
        // Add new item to cartItems
        cart.cartItems.push({
          productId,
          quantity,
          subtotal
        });
      }
    });

    // Calculate the new totalPrice based on updated quantities
    cart.totalPrice = totalPriceFloat;

    // Save the updated cart
    await cart.save();

    return res.status(200).send(cart);
  } catch (error) {
    console.error("Error in changeProductQuantity:", error);
    return res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports.removeProductFromCart = (req, res) => {
  const { productId } = req.params;

  // Find the cart for the user
  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({
          message: "Cart not found",
        });
      }

      // Find index of cartItem to remove
      const indexToRemove = cart.cartItems.findIndex(
        (item) => item.productId === productId
      );

      if (indexToRemove === -1) {
        return res.status(404).json({
          message: `Item not found in cart`
        });
      }

      // Calculate the subtotal of the item being removed
      const removedItemSubtotal = cart.cartItems[indexToRemove].subtotal;

      // Remove item from cartItems array
      cart.cartItems.splice(indexToRemove, 1);

      // Update totalPrice for the cart
      cart.totalPrice -= removedItemSubtotal;

      // Save updated cart
      return cart
        .save()
        .then((savedCart) => {
          return res.status(200).send({
            message: `Item removed from cart successfully`,
            updatedCart: savedCart
          });
        })
        .catch((error) => errorHandler(error, req, res));
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.clearCart = (req, res) => {
  // Find the cart for the user
  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({
          message: "Cart not found",
        });
      }

      // Clear cartItems array
      cart.cartItems = [];

      // Reset totalPrice
      cart.totalPrice = 0;

      // Save updated cart
      return cart
        .save()
        .then((savedCart) => {
          return res.status(200).send({
            message: "Cart cleared successfully",
            cart: savedCart
          });
        })
        .catch((error) => errorHandler(error, req, res));
    })
    .catch((err) => errorHandler(err, req, res));
};
