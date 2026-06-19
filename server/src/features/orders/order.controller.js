import * as orderModel from './order.model.js';
import ApiError from '../../shared/errors/ApiError.js';
import { triggerOrderWebhook } from '../../integrations/ims/imsClient.js';

/**
 * Handle checkout submission and order storage.
 */
export const createOrder = async (req, res, next) => {
  try {
    const { totalAmount, shippingAddress, items } = req.body;
    const userId = req.user.id;

    if (!totalAmount || !shippingAddress || !items || !items.length) {
      return next(new ApiError(400, 'Please provide totalAmount, shippingAddress, and order items.'));
    }

    const order = await orderModel.createOrder(userId, {
      totalAmount: parseFloat(totalAmount),
      shippingAddress,
      items,
    });

    // Fetch order items with names for IMS webhook mapping
    const itemsWithNames = await orderModel.getOrderItemsWithNames(order.id);

    // Trigger webhook asynchronously to update IMS stocks and record sale
    triggerOrderWebhook(order.id, itemsWithNames).catch(err => {
      console.error('[IMS Webhook Error] Failed to process webhook:', err.message);
    });

    res.status(201).json({
      status: 'success',
      data: {
        order,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch orders list for authenticated customer.
 */
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.findByUser(req.user.id);
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch all orders for administration dashboard view.
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.findAll();
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update order shipment state or payment success state (admin).
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { order_status, payment_status } = req.body;
    const orderId = req.params.id;

    if (!order_status && !payment_status) {
      return next(new ApiError(400, 'Please provide order_status or payment_status to update.'));
    }

    const updatedOrder = await orderModel.updateStatus(orderId, { order_status, payment_status });
    if (!updatedOrder) {
      return next(new ApiError(404, 'No order found with that ID.'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder,
      },
    });
  } catch (err) {
    next(err);
  }
};
