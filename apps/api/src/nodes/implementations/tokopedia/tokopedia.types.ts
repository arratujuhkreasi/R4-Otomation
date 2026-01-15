/**
 * Tokopedia Node Types
 * 
 * Type definitions for Tokopedia Open API integration.
 * 
 * ============================================================
 * HOW TO GET YOUR TOKOPEDIA API CREDENTIALS:
 * ============================================================
 * 
 * 1. Daftar sebagai seller di Tokopedia
 * 2. Buka https://seller.tokopedia.com/
 * 3. Pergi ke Pengaturan > Integrasi > API
 * 4. Daftarkan aplikasi Anda
 * 5. Anda akan mendapatkan:
 *    - Client ID (App ID)
 *    - Client Secret
 *    - Shop ID
 * 
 * API Documentation: https://developer.tokopedia.com/openapi/guide
 * ============================================================
 */

export interface TokopediaCredentials {
    clientId: string;
    clientSecret: string;
    shopId: string;
    fsId?: string; // Fulfillment Service ID
}

export type TokopediaOperation =
    | 'getOrders'
    | 'getOrderDetail'
    | 'acceptOrder'
    | 'rejectOrder'
    | 'getProducts'
    | 'getProductInfo'
    | 'updateStock'
    | 'updatePrice'
    | 'getShopInfo'
    | 'confirmShipping';

export interface TokopediaOrder {
    order_id: number;
    order_status: number;
    invoice_ref_num: string;
    buyer: {
        id: number;
        name: string;
        phone: string;
        email: string;
    };
    products: TokopediaOrderProduct[];
    shipping: {
        id: number;
        product_id: number;
        product_name: string;
        awb: string;
    };
    amt: {
        ttl_product_price: number;
        shipping_cost: number;
        insurance_cost: number;
        ttl_amount: number;
    };
    create_time: string;
    payment_date: string;
}

export interface TokopediaOrderProduct {
    id: number;
    name: string;
    quantity: number;
    notes: string;
    weight: number;
    total_weight: number;
    price: number;
    total_price: number;
    currency: string;
    sku: string;
}

export interface TokopediaProduct {
    basic: {
        productID: number;
        shopID: number;
        status: number;
        name: string;
        condition: string;
        childCategoryID: number;
        shortDesc: string;
    };
    price: {
        value: number;
        currency: string;
        idr: number;
    };
    weight: {
        value: number;
        unit: string;
    };
    stock: {
        value: number;
        stockWording: string;
    };
    pictures: Array<{
        picID: number;
        filePath: string;
        fileName: string;
        width: number;
        height: number;
        URL: string;
    }>;
}

export interface TokopediaApiResponse<T> {
    header: {
        process_time: number;
        messages: string;
        reason: string;
        error_code: string;
    };
    data: T;
}

// Order status codes
export const TOKOPEDIA_ORDER_STATUS = {
    0: 'Seller cancel order',
    3: 'Order Reject Due Empty Stock',
    5: 'Order Cancelled by Fraud',
    6: 'Order Rejected (Auto Cancel Out of Stock)',
    10: 'Order rejected by seller',
    15: 'Instant Cancel by Buyer',
    100: 'Pending order (Not paid yet)',
    103: 'Wait for partner approval',
    220: 'Payment verified, waiting for seller confirmation',
    221: 'Order accepted', // Ready to pickup
    400: 'Seller is processing order',
    450: 'Waiting for pickup',
    500: 'Order shipped',
    501: 'Order arrived at destination',
    520: 'Order invalid / returned',
    540: 'Delivered to Buyer',
    550: 'Order is being processed',
    600: 'Order finished',
    601: 'Order finished with partial cancel',
    690: 'Fraud rejected',
    700: 'Order cancelled',
} as const;
