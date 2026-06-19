import express from "express";
import * as productController from "./product.controller.js";
import { protect, restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get('/categories', productController.getCategories);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(protect, restrictTo("admin"), productController.createProduct);

router
  .route("/:id")
  .get(productController.getProductById)
  .put(protect, restrictTo("admin"), productController.updateProduct)
  .delete(protect, restrictTo("admin"), productController.deleteProduct);

router.post("/:id/reviews", protect, productController.createProductReview);

export default router;
