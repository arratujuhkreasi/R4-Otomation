/**
 * Lazada Open Platform Node
 * 
 * ============================================================
 * HOW TO GET LAZADA API CREDENTIALS:
 * ============================================================
 * 
 * 1. Daftar di https://open.lazada.com/
 * 2. Buat aplikasi baru
 * 3. Dapatkan App Key dan App Secret
 * 4. Gunakan OAuth untuk mendapatkan Access Token
 * 
 * API Documentation: https://open.lazada.com/doc/api.htm
 * ============================================================
 */

import crypto from 'crypto';
import { BaseNode } from '../../BaseNode';
import {
    NodeCategory,
    NodeCredentialRequirement,
    NodeCredentials,
    NodeExecutionContext,
    NodeInputData,
    NodeOutputData,
    NodeProperty,
    NodeExecutionError,
} from '../../Node.interface';

interface LazadaCredentials {
    appKey: string;
    appSecret: string;
    accessToken: string;
}

export class LazadaNode extends BaseNode {
    readonly name = 'lazada';
    readonly displayName = 'Lazada';
    readonly description = 'Manage orders and products on Lazada marketplace';
    readonly version = 1;
    readonly category: NodeCategory = 'action';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-shopping-cart',
        color: '#0F146D',
    };

    readonly defaults = { name: 'Lazada', color: '#0F146D' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'lazadaApi', required: true, displayName: 'Lazada Open Platform API' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'getOrders',
            required: true,
            options: [
                { name: 'Get Orders', value: 'getOrders' },
                { name: 'Get Order Detail', value: 'getOrderDetail' },
                { name: 'Get Order Items', value: 'getOrderItems' },
                { name: 'Set Status to Packed', value: 'setStatusToPacked' },
                { name: 'Set Status to Ready to Ship', value: 'setStatusToReadyToShip' },
                { name: 'Get Products', value: 'getProducts' },
                { name: 'Update Price Quantity', value: 'updatePriceQuantity' },
                { name: 'Get Seller Info', value: 'getSellerInfo' },
            ],
        },
        {
            name: 'orderId',
            displayName: 'Order ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['getOrderDetail', 'getOrderItems', 'setStatusToPacked', 'setStatusToReadyToShip'] } },
        },
        {
            name: 'orderItemIds',
            displayName: 'Order Item IDs (comma separated)',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['setStatusToPacked', 'setStatusToReadyToShip'] } },
        },
        {
            name: 'shipmentProvider',
            displayName: 'Shipment Provider',
            type: 'string',
            default: '',
            placeholder: 'JNE',
            displayOptions: { show: { operation: ['setStatusToReadyToShip'] } },
        },
        {
            name: 'trackingNumber',
            displayName: 'Tracking Number',
            type: 'string',
            default: '',
            displayOptions: { show: { operation: ['setStatusToReadyToShip'] } },
        },
        {
            name: 'sku',
            displayName: 'SKU',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['updatePriceQuantity'] } },
        },
        {
            name: 'newPrice',
            displayName: 'New Price',
            type: 'number',
            default: 0,
            displayOptions: { show: { operation: ['updatePriceQuantity'] } },
        },
        {
            name: 'newQuantity',
            displayName: 'New Quantity',
            type: 'number',
            default: 0,
            displayOptions: { show: { operation: ['updatePriceQuantity'] } },
        },
        {
            name: 'createdAfter',
            displayName: 'Created After',
            type: 'string',
            default: '',
            placeholder: '2024-01-01T00:00:00+07:00',
            displayOptions: { show: { operation: ['getOrders'] } },
        },
        {
            name: 'status',
            displayName: 'Order Status',
            type: 'options',
            default: '',
            options: [
                { name: 'All', value: '' },
                { name: 'Pending', value: 'pending' },
                { name: 'Ready to Ship', value: 'ready_to_ship' },
                { name: 'Shipped', value: 'shipped' },
                { name: 'Delivered', value: 'delivered' },
                { name: 'Cancelled', value: 'canceled' },
            ],
            displayOptions: { show: { operation: ['getOrders'] } },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.lazadaApi as unknown as LazadaCredentials;

        if (!creds?.appKey || !creds?.appSecret || !creds?.accessToken) {
            throw new NodeExecutionError('Missing Lazada credentials', this.name, context.nodeId);
        }

        const baseUrl = 'https://api.lazada.co.id/rest';

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'getOrders');
            let response: unknown;
            let apiPath: string;
            const params: Record<string, string> = {};

            switch (operation) {
                case 'getOrders':
                    apiPath = '/orders/get';
                    const createdAfter = this.getParam<string>(context, 'createdAfter', index, '');
                    const status = this.getParam<string>(context, 'status', index, '');
                    if (createdAfter) params.created_after = createdAfter;
                    if (status) params.status = status;
                    break;

                case 'getOrderDetail':
                    apiPath = '/order/get';
                    params.order_id = this.getParam<string>(context, 'orderId', index);
                    break;

                case 'getOrderItems':
                    apiPath = '/order/items/get';
                    params.order_id = this.getParam<string>(context, 'orderId', index);
                    break;

                case 'setStatusToPacked':
                    apiPath = '/order/pack';
                    params.order_item_ids = `[${this.getParam<string>(context, 'orderItemIds', index)}]`;
                    params.shipping_provider = 'Dropship';
                    break;

                case 'setStatusToReadyToShip':
                    apiPath = '/order/rts';
                    params.order_item_ids = `[${this.getParam<string>(context, 'orderItemIds', index)}]`;
                    const shipmentProvider = this.getParam<string>(context, 'shipmentProvider', index, '');
                    const trackingNumber = this.getParam<string>(context, 'trackingNumber', index, '');
                    if (shipmentProvider) params.shipment_provider = shipmentProvider;
                    if (trackingNumber) params.tracking_number = trackingNumber;
                    break;

                case 'getProducts':
                    apiPath = '/products/get';
                    break;

                case 'updatePriceQuantity':
                    apiPath = '/product/price_quantity/update';
                    const sku = this.getParam<string>(context, 'sku', index);
                    const newPrice = this.getParam<number>(context, 'newPrice', index, 0);
                    const newQuantity = this.getParam<number>(context, 'newQuantity', index, 0);
                    params.payload = JSON.stringify({
                        Request: {
                            Product: {
                                Skus: {
                                    Sku: [{
                                        SellerSku: sku,
                                        Price: newPrice,
                                        Quantity: newQuantity,
                                    }],
                                },
                            },
                        },
                    });
                    break;

                case 'getSellerInfo':
                    apiPath = '/seller/get';
                    break;

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            // Build signed URL
            const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
            const signParams: Record<string, string> = {
                app_key: creds.appKey,
                access_token: creds.accessToken,
                timestamp,
                sign_method: 'sha256',
                ...params,
            };

            const sign = this.generateSign(apiPath, signParams, creds.appSecret);
            signParams.sign = sign;

            const queryString = Object.entries(signParams)
                .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
                .join('&');

            response = await this.httpRequest(context, {
                method: 'GET',
                url: `${baseUrl}${apiPath}?${queryString}`,
            });

            return { json: { ...item.json, lazada: { operation, response } } };
        });
    }

    private generateSign(apiPath: string, params: Record<string, string>, secret: string): string {
        const sortedKeys = Object.keys(params).sort();
        let signStr = apiPath;
        for (const key of sortedKeys) {
            signStr += key + params[key];
        }
        return crypto.createHmac('sha256', secret).update(signStr).digest('hex').toUpperCase();
    }
}

export const lazadaNode = new LazadaNode();
