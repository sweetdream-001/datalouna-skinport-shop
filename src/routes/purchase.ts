// Endpoint 2: Purchase a product
import { Hono } from 'hono';
import { z } from 'zod';
import { sql } from '../db/client.js';
import type { PurchaseResponse } from '../types/index.js';
import { ERROR_MESSAGES } from '../config/constants.js';
import { roundToDecimalPlaces } from '../utils/math.js';

const purchase = new Hono();

const purchaseSchema = z.object({
  userId: z.coerce.number().int().positive(),
  productId: z.coerce.number().int().positive(),
});

purchase.post('/', async (c) => {
  try {
    // Parse and validate request body
    const body = await c.req.json();
    const validationResult = purchaseSchema.safeParse(body);
    
    if (!validationResult.success) {
      return c.json(
        { success: false, message: ERROR_MESSAGES.INVALID_REQUEST },
        400
      );
    }
    
    const { userId, productId } = validationResult.data;
    
    // Use transaction to ensure atomicity
    const result = await sql.begin(async (sql) => {
      // Get user balance and product price in one transaction
      const [user] = await sql`
        SELECT id, username, balance 
        FROM users 
        WHERE id = ${userId}
        FOR UPDATE
      `;
      
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      
      const [product] = await sql`
        SELECT id, name, price 
        FROM products 
        WHERE id = ${productId}
      `;
      
      if (!product) {
        throw new Error(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }
      
      const userBalance = Number(user.balance);
      const productPrice = Number(product.price);
      
      if (userBalance < productPrice) {
        throw new Error(ERROR_MESSAGES.INSUFFICIENT_BALANCE);
      }
      
      const newBalance = userBalance - productPrice;
      
      await sql`
        UPDATE users 
        SET balance = ${newBalance} 
        WHERE id = ${userId}
      `;
      
      await sql`
        INSERT INTO purchases (user_id, product_id, price_paid)
        VALUES (${userId}, ${productId}, ${product.price})
      `;
      
      return {
        success: true,
        newBalance: roundToDecimalPlaces(newBalance),
      };
    });
    
    return c.json(result as PurchaseResponse);
    
  } catch (error) {
    console.error('Error in purchase endpoint:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message === ERROR_MESSAGES.USER_NOT_FOUND || message === ERROR_MESSAGES.PRODUCT_NOT_FOUND) {
      return c.json({ success: false, message }, 404);
    }
    
    if (message === ERROR_MESSAGES.INSUFFICIENT_BALANCE) {
      return c.json({ success: false, message }, 400);
    }
    
    return c.json({ success: false, message: 'Purchase failed' }, 500);
  }
});

export default purchase;

