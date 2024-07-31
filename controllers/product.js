const Product = require("../models/Product");
const { errorHandler } = require("../auth");

module.exports.createNewProduct = (req, res) => {
  if (req.user.isAdmin) {
    // double check if a user was a admin
    const newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      isActive: req.body.isActive,
    }); // handle all data from postman request body

    // use this return to save new product data to mongoDB
    return (
      newProduct
        .save()
        // use then if new product successfully added to mongoDB
        .then((product) => {
          return res.status(201).send({
            product: product,
          });
        })
        // use catch if there's an error while saving a new product to mongoDB
        .catch((err) => errorHandler(err, req, res))
    );
  } else {
    return res.status(403).send("Access Forbidden"); // if user wasn't admin show this return
  }
};

module.exports.retrieveAllproduct = async (req, res) => {
  return await Product.find() // use find function/method to show all products
    .then((product) => {
      if (product.length > 0) {
        // use if condition if product greather than 0
        return res.status(201).send({ products: product });
      } else {
        // use else condition if product less than 0
        return res.status(404).send({ message: "No product found" });
      }
    })
    // use catch if there's an while finding a product
    .catch((err) => errorHandler(err, req, res));
};

module.exports.retrieveActiveproduct = async (req, res) => {
  return await Product.find({ isActive: true }) // use find function/method that will handle a isActive argument and it will find all isActive value true
    .then((product) => {
      if (product.length > 0) {
        // use if condition if product has a data
        return res.status(201).send({ products: product });
      } else {
        return res.status(404).send({ message: "No product found" }); // show this message if there's no product found
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.retrieveProductById = async (req, res) => {
  const productId = req.params.productId; // this variable handle a id from postman params

  return await Product.findById(productId)// use find function/method to show specific product using id
    .then((product) => {
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }

      return res.status(200).send({ product });
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.updateProductById = async (req, res) => {
  const productId = req.params.productId; // use req.params.productId not id

  console.log("productId", productId); // Log the correct productId

  return await Product.findByIdAndUpdate(
    productId,
    {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      isActive: req.body.isActive,
    },
    { new: true }
  )
    .then((updatedProduct) => {
      if (updatedProduct) {
        return res.status(200).send({
          message: "Product updated successfully",
          updatedProduct: updatedProduct,
        });
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    })
    .catch((err) => errorHandler(err, req, res));
};

module.exports.archiveProduct = async (req, res) => {
  const productId = req.params.productId; // handle a postman params id

  let updateActiveField = {
    isActive: false,
  }; // initialized a value of isActive

  await Product.findByIdAndUpdate(productId, updateActiveField)
    .then((product) => {
      if (product) {
        if (!product.isActive) {
          return res.status(200).send({
            message: "Product already archived",
            product: product,
          });
        }
        return res.status(200).send({
          message: "Product archived successfully",
          archiveProduct: product,
        });
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.activateProduct = (req, res) => {
  const productId = req.params.productId;

  let updateActiveField = {
    isActive: true,
  };

  Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then((product) => {
      if (product) {
        if (product.isActive) {
          return res.status(200).send({
            message: "Product already activated",
            product: product,
          });
        }
        return res.status(200).send({
          message: "Product activated successfully",
          activateProduct: product,
        });
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.searchProductsByName = async (req, res) => {
  const searchProductName = req.body.name;

  if (!searchProductName) {
    return res.status(400).send({
      message: "Search 'name' is required",
    });
  }

  return await Product.find({
    name: { $regex: searchProductName, $options: "i" },
  }).then((products) => {
    if (products.length > 0) {
      return res.status(200).send(products);
    } else {
      return res.status(404).send({
        message: "Product name not found",
      });
    }
  });
};

module.exports.searchProductByPrice = async (req, res) => {
  const { minPrice, maxPrice } = req.body;
  // Find products within the price range
  Product.find({
    price: { $gte: minPrice, $lte: maxPrice }
  })
    .then(products => {
      res.status(200).send(products);
    })
    .catch((error) => errorHandler(error, req, res));

}
