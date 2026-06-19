import express from "express";
import * as dashboardController from './dashboard.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Only admin users can access analytics endpoints
router.get(
  "/stats",
  protect,
  restrictTo("admin"),
  dashboardController.getStats,
);

export default router;
