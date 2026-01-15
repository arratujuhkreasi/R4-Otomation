/**
 * Shopee Node Types
 * 
 * ============================================================
 * HOW TO GET SHOPEE API CREDENTIALS:
 * ============================================================
 * 
 * 1. Daftar di https://open.shopee.com/
 * 2. Buat aplikasi baru
 * 3. Dapatkan Partner ID dan Partner Key
 * 4. Lakukan OAuth untuk mendapatkan Shop ID dan Access Token
 * 
 * API Documentation: https://open.shopee.com/documents
 * ============================================================
 */

export interface ShopeeCredentials {
    partnerId: string;
    partnerKey: string;
    shopId: string;
    accessToken: string;
}

export type ShopeeOperation =
    | 'getOrders'
    | 'getOrderDetail'
    | 'getProducts'
    | 'getProductDetail'
    | 'updateStock'
    | 'updatePrice'
    | 'shipOrder'
    | 'getShippingParameter'
    | 'getShopInfo';

export interface ShopeeOrder {
    order_sn: string;
    order_status: string;
    buyer_user_id: number;
    buyer_username: string;
    recipient_address: {
        name: string;
        phone: string;
        full_address: string;
        city: string;
        state: string;
        zipcode: string;
    };
    item_list: ShopeeOrderItem[];
    total_amount: number;
    shipping_carrier: string;
    create_time: number;
    update_time: number;
    payment_method: string;
}

export interface ShopeeOrderItem {
    item_id: number;
    item_name: string;
    item_sku: string;
    model_id: number;
    model_name: string;
    model_quantity_purchased: number;
    model_original_price: number;
    model_discounted_price: number;
}

export interface ShopeeProduct {
    item_id: number;
    item_name: string;
    item_sku: string;
    item_status: string;
    description: string;
    images: string[];
    price_info: {
        current_price: number;
        original_price: number;
    }[];
    stock_info: {
        stock_type: number;
        current_stock: number;
    }[];
    category_id: number;
    create_time: number;
    update_time: number;
}

export const SHOPEE_ORDER_STATUS = {
    UNPAID: 'Belum bayar',
    READY_TO_SHIP: 'Siap dikirim',
    PROCESSED: 'Sedang diproses',
    SHIPPED: 'Dikirim',
    COMPLETED: 'Selesai',
    IN_CANCEL: 'Dalam proses pembatalan',
    CANCELLED: 'Dibatalkan',
    INVOICE_PENDING: 'Menunggu invoice',
} as const;
