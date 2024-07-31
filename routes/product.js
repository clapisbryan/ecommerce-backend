const express = require("express");

const productController = require("../controllers/product");

const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.post("/", verify, verifyAdmin, productController.createNewProduct); 					// Create New Product (admin only)
router.get("/all", verify, verifyAdmin, productController.retrieveAllproduct); 				// Retrieves all products.
router.get("/active", productController.retrieveActiveproduct); 							// Retrieves active products.
router.get("/:productId", productController.retrieveProductById); 							// Retrieves a single product by ID
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProductById); // Updates a product by ID (admin only)
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct); // Archives a product by ID (admin only)
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);// Activates a product by ID (admin only)
router.post("/search-by-name", productController.searchProductsByName)
router.post("/search-by-price", productController.searchProductByPrice);

module.exports = router;