import express from "express";
import * as orderController from './order.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All order routes require authentication

router
  .route("/")
  .post(orderController.createOrder)
  .get(restrictTo("admin"), orderController.getAllOrders);

router.get("/my-orders", orderController.getMyOrders);

router.patch(
  "/:id/status",
  restrictTo("admin"),
  orderController.updateOrderStatus,
);

export default router;
