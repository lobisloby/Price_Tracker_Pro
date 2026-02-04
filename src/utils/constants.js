// src/utils/constants.js

export const N8N_WEBHOOKS = {
  // ✅ Updated to new Supabase endpoints
  addProduct: 'https://totitaaa.app.n8n.cloud/webhook/add-product',
  sync: 'https://totitaaa.app.n8n.cloud/webhook/sync',
  deleteProduct: 'https://totitaaa.app.n8n.cloud/webhook/delete-product',
};

export const SUPPORTED_SITES = {
  ALIEXPRESS: 'aliexpress',
};

export const DEFAULT_SETTINGS = {
  checkFrequency: 60, // minutes
  enableNotifications: true,
  enableBadge: true,
};

export const FREE_PLAN_LIMITS = {
  maxProducts: 10,
  maxPriceHistory: 30,
};