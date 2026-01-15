/**
 * Shopee Open Platform Node
 * 
 * Integration node for Shopee marketplace.
 * API Documentation: https://open.shopee.com/documents
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
import { ShopeeCredentials, ShopeeOperation } from './shopee.types';

export class ShopeeNode extends BaseNode {
    readonly name = 'shopee';
    readonly displayName = 'Shopee';
    readonly description = 'Manage orders, products, and shipping on Shopee marketplace';
    readonly version = 1;
    readonly category: NodeCategory = 'action';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-shopping-cart',
        color: '#EE4D2D',
    };

    readonly defaults = {
        name: 'Shopee',
        color: '#EE4D2D',
    };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'shopeeApi', required: true, displayName: 'Shopee API' },
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
                { name: 'Get Products', value: 'getProducts' },
                { name: 'Get Product Detail', value: 'getProductDetail' },
                { name: 'Update Stock', value: 'updateStock' },
                { name: 'Update Price', value: 'updatePrice' },
                { name: 'Ship Order', value: 'shipOrder' },
                { name: 'Get Shipping Parameter', value: 'getShippingParameter' },
                { name: 'Get Shop Info', value: 'getShopInfo' },
            ],
        },
        {
            name: 'orderStatus',
            displayName: 'Order Status',
            type: 'options',
            default: 'READY_TO_SHIP',
            options: [
                { name: 'All', value: '' },
                { name: 'Unpaid', value: 'UNPAID' },
                { name: 'Ready to Ship', value: 'READY_TO_SHIP' },
                { name: 'Processed', value: 'PROCESSED' },
                { name: 'Shipped', value: 'SHIPPED' },
                { name: 'Completed', value: 'COMPLETED' },
                { name: 'Cancelled', value: 'CANCELLED' },
            ],
            displayOptions: { show: { operation: ['getOrders'] } },
        },
        {
            name: 'timeRangeField',
            displayName: 'Time Range Field',
            type: 'options',
            default: 'create_time',
            options: [
                { name: 'Create Time', value: 'create_time' },
                { name: 'Update Time', value: 'update_time' },
            ],
            displayOptions: { show: { operation: ['getOrders'] } },
        },
        {
            name: 'timeFrom',
            displayName: 'Time From',
            type: 'string',
            default: '',
            placeholder: '2024-01-01',
            displayOptions: { show: { operation: ['getOrders'] } },
        },
        {
            name: 'timeTo',
            displayName: 'Time To',
            type: 'string',
            default: '',
            placeholder: '2024-12-31',
            displayOptions: { show: { operation: ['getOrders'] } },
        },
        {
            name: 'orderSn',
            displayName: 'Order SN',
            type: 'string',
            default: '',
            required: true,
            placeholder: '240115ABC123DEF',
            displayOptions: { show: { operation: ['getOrderDetail', 'shipOrder', 'getShippingParameter'] } },
        },
        {
            name: 'itemId',
            displayName: 'Item ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['getProductDetail', 'updateStock', 'updatePrice'] } },
        },
        {
            name: 'newStock',
            displayName: 'New Stock',
            type: 'number',
            default: 0,
            required: true,
            displayOptions: { show: { operation: ['updateStock'] } },
        },
        {
            name: 'newPrice',
            displayName: 'New Price',
            type: 'number',
            default: 0,
            required: true,
            displayOptions: { show: { operation: ['updatePrice'] } },
        },
        {
            name: 'trackingNumber',
            displayName: 'Tracking Number',
            type: 'string',
            default: '',
            placeholder: 'JNE123456789',
            displayOptions: { show: { operation: ['shipOrder'] } },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.shopeeApi as unknown as ShopeeCredentials;

        if (!creds?.partnerId || !creds?.partnerKey || !creds?.shopId) {
            throw new NodeExecutionError(
                'Missing Shopee credentials',
                this.name,
                context.nodeId,
                { description: 'Please configure Partner ID, Partner Key, Shop ID, and Access Token.' }
            );
        }

        const baseUrl = 'https://partner.shopeemobile.com';

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<ShopeeOperation>(context, 'operation', index, 'getOrders');
            let response: unknown;
            let path: string;
            let body: Record<string, unknown> = {};

            const timestamp = Math.floor(Date.now() / 1000);

            switch (operation) {
                case 'getOrders': {
                    path = '/api/v2/order/get_order_list';
                    const status = this.getParam<string>(context, 'orderStatus', index, '');
                    const timeField = this.getParam<string>(context, 'timeRangeField', index, 'create_time');
                    const timeFrom = this.getParam<string>(context, 'timeFrom', index, '');
                    const timeTo = this.getParam<string>(context, 'timeTo', index, '');

                    body = {
                        time_range_field: timeField,
                        time_from: timeFrom ? Math.floor(new Date(timeFrom).getTime() / 1000) : timestamp - 86400 * 15,
                        time_to: timeTo ? Math.floor(new Date(timeTo).getTime() / 1000) : timestamp,
                        page_size: 50,
                    };

                    if (status) body.order_status = status;
                    break;
                }

                case 'getOrderDetail': {
                    path = '/api/v2/order/get_order_detail';
                    const orderSn = this.getParam<string>(context, 'orderSn', index);
                    body = {
                        order_sn_list: [orderSn],
                        response_optional_fields: [
                            'buyer_user_id', 'buyer_username', 'recipient_address',
                            'item_list', 'shipping_carrier', 'payment_method',
                        ],
                    };
                    break;
                }

                case 'getProducts': {
                    path = '/api/v2/product/get_item_list';
                    body = {
                        offset: 0,
                        page_size: 50,
                        item_status: ['NORMAL', 'BANNED', 'UNLIST'],
                    };
                    break;
                }

                case 'getProductDetail': {
                    path = '/api/v2/product/get_item_base_info';
                    const itemId = this.getParam<string>(context, 'itemId', index);
                    body = { item_id_list: [parseInt(itemId)] };
                    break;
                }

                case 'updateStock': {
                    path = '/api/v2/product/update_stock';
                    const itemId = this.getParam<string>(context, 'itemId', index);
                    const newStock = this.getParam<number>(context, 'newStock', index, 0);
                    body = {
                        item_id: parseInt(itemId),
                        stock_list: [{ stock: newStock }],
                    };
                    break;
                }

                case 'updatePrice': {
                    path = '/api/v2/product/update_price';
                    const itemId = this.getParam<string>(context, 'itemId', index);
                    const newPrice = this.getParam<number>(context, 'newPrice', index, 0);
                    body = {
                        item_id: parseInt(itemId),
                        price_list: [{ original_price: newPrice }],
                    };
                    break;
                }

                case 'shipOrder': {
                    path = '/api/v2/logistics/ship_order';
                    const orderSn = this.getParam<string>(context, 'orderSn', index);
                    const trackingNumber = this.getParam<string>(context, 'trackingNumber', index, '');
                    body = { order_sn: orderSn };
                    if (trackingNumber) body.tracking_number = trackingNumber;
                    break;
                }

                case 'getShippingParameter': {
                    path = '/api/v2/logistics/get_shipping_parameter';
                    const orderSn = this.getParam<string>(context, 'orderSn', index);
                    body = { order_sn: orderSn };
                    break;
                }

                case 'getShopInfo': {
                    path = '/api/v2/shop/get_shop_info';
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            // Generate signature
            const signature = this.generateSignature(creds, path, timestamp);
            const url = `${baseUrl}${path}?partner_id=${creds.partnerId}&timestamp=${timestamp}&sign=${signature}&shop_id=${creds.shopId}&access_token=${creds.accessToken}`;

            response = await this.httpRequest(context, {
                method: 'POST',
                url,
                headers: { 'Content-Type': 'application/json' },
                body,
            });

            return {
                json: { ...item.json, shopee: { operation, response } },
            };
        });
    }

    private generateSignature(creds: ShopeeCredentials, path: string, timestamp: number): string {
        const baseString = `${creds.partnerId}${path}${timestamp}${creds.accessToken}${creds.shopId}`;
        return crypto.createHmac('sha256', creds.partnerKey).update(baseString).digest('hex');
    }
}

export const shopeeNode = new ShopeeNode();
