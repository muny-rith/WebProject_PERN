import dotenv from 'dotenv';

dotenv.config();

const IMS_API_URL = process.env.IMS_API_URL || 'http://localhost:5002/api';

/**
 * Fetch all stock levels from IMS.
 * Returns an object mapping product name to quantity: { "Product Name": stock }
 * Returns null if the request fails (enables graceful fallback).
 */
export const fetchIMSStocks = async () => {
  try {
    const res = await fetch(`${IMS_API_URL}/products/external/stocks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(3000) // 3 seconds timeout
    });
    
    if (!res.ok) {
      console.warn(`[IMS Integration] IMS responded with status ${res.status}`);
      return null;
    }
    
    const body = await res.json();
    if (body && body.status === 'success') {
      return body.data;
    }
    return null;
  } catch (err) {
    console.error('[IMS Integration] Failed to connect to IMS for stock check:', err.message);
    return null;
  }
};

/**
 * Trigger order webhook in IMS to deduct stock and record sale.
 */
export const triggerOrderWebhook = async (orderId, items) => {
  try {
    const payload = {
      orderId,
      items: items.map(item => ({
        productName: item.productName || item.name,
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    const res = await fetch(`${IMS_API_URL}/webhooks/ecom-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000) // 5 seconds timeout
    });

    if (!res.ok) {
      console.error(`[IMS Integration] IMS webhook responded with status ${res.status}`);
      return null;
    }

    const body = await res.json();
    return body;
  } catch (err) {
    console.error(`[IMS Integration] Failed to send order webhook for Order #${orderId} to IMS:`, err.message);
    return null;
  }
};
