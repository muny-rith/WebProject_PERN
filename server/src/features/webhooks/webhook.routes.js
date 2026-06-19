import express from 'express';
import { handleImsProductWebhook, handleImsProductDeleteWebhook, handleImsCategoryWebhook, handleImsCategoryDeleteWebhook } from './webhook.controller.js';

const router = express.Router();

// Webhook endpoint (doesn't require standard E-Commerce customer/admin user auth since it's server-to-server)
router.route('/ims-product')
  .post(handleImsProductWebhook)
  .delete(handleImsProductDeleteWebhook);

router.route('/ims-category')
  .post(handleImsCategoryWebhook)
  .delete(handleImsCategoryDeleteWebhook);

export default router;

