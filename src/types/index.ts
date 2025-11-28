// Type definitions for the application

export interface SkinportItem {
  market_hash_name: string;
  currency: string;
  suggested_price: number;
  item_page: string;
  market_page: string;
  min_price: number;
  max_price: number;
  mean_price: number;
  quantity: number;
  created_at: number;
  updated_at: number;
}

export interface ItemPrice {
  name: string;
  tradablePrice: number;
  nonTradablePrice: number;
}

export interface PurchaseRequest {
  userId: number;
  productId: number;
}

export interface PurchaseResponse {
  success: boolean;
  message?: string;
  newBalance?: number;
}

export interface User {
  id: number;
  username: string;
  balance: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
}

