/**
 * Tokopedia Open API Node
 * 
 * Integration node for Tokopedia marketplace.
 * Supports order management, product management, and shipping.
 * 
 * API Documentation: https://developer.tokopedia.com/openapi/guide
 */

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
import { TokopediaCredentials, TokopediaOperation } from './tokopedia.types';

export class TokopediaNode extends BaseNode {
    readonly name = 'tokopedia';
    readonly displayName = 'Tokopedia';
    readonly description = 'Manage orders, products, and shipping on Tokopedia marketplace';
    readonly version = 1;
    readonly category: NodeCategory = 'action';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-shopping-bag',
        color: '#42b549',
    };

    readonly defaults = {
        name: 'Tokopedia',
        color: '#42b549',
    };

    readonly credentials: NodeCredentialRequirement[] = [
        {
            name: 'tokopediaApi',
            required: true,
            displayName: 'Tokopedia API',
        },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'getOrders',
            required: true,
            description: 'Operation to perform',
            options: [
                { name: 'Get Orders', value: 'getOrders', description: 'Get list of orders' },
                { name: 'Get Order Detail', value: 'getOrderDetail', description: 'Get specific order details' },
                { name: 'Accept Order', value: 'acceptOrder', description: 'Accept an order' },
                { name: 'Reject Order', value: 'rejectOrder', description: 'Reject an order' },
                { name: 'Get Products', value: 'getProducts', description: 'Get list of products' },
                { name: 'Get Product Info', value: 'getProductInfo', description: 'Get product details' },
                { name: 'Update Stock', value: 'updateStock', description: 'Update product stock' },
                { name: 'Update Price', value: 'updatePrice', description: 'Update product price' },
                { name: 'Confirm Shipping', value: 'confirmShipping', description: 'Confirm order shipping with AWB' },
                { name: 'Get Shop Info', value: 'getShopInfo', description: 'Get shop information' },
            ],
        },
        // Order filters
        {
            name: 'orderStatus',
            displayName: 'Order Status',
            type: 'options',
            default: '220',
            description: 'Filter orders by status',
            options: [
                { name: 'All', value: '' },
                { name: 'New Order (Not Paid)', value: '100' },
                { name: 'Payment Verified', value: '220' },
                { name: 'Order Accepted', value: '221' },
                { name: 'Processing', value: '400' },
                { name: 'Waiting Pickup', value: '450' },
                { name: 'Shipped', value: '500' },
                { name: 'Delivered', value: '540' },
                { name: 'Finished', value: '600' },
            ],
            displayOptions: {
                show: { operation: ['getOrders'] },
            },
        },
        {
            name: 'fromDate',
            displayName: 'From Date',
            type: 'string',
            default: '',
            placeholder: '2024-01-01',
            description: 'Start date filter (YYYY-MM-DD)',
            displayOptions: {
                show: { operation: ['getOrders'] },
            },
        },
        {
            name: 'toDate',
            displayName: 'To Date',
            type: 'string',
            default: '',
            placeholder: '2024-12-31',
            description: 'End date filter (YYYY-MM-DD)',
            displayOptions: {
                show: { operation: ['getOrders'] },
            },
        },
        {
            name: 'page',
            displayName: 'Page',
            type: 'number',
            default: 1,
            description: 'Page number for pagination',
            displayOptions: {
                show: { operation: ['getOrders', 'getProducts'] },
            },
        },
        {
            name: 'perPage',
            displayName: 'Per Page',
            type: 'number',
            default: 10,
            description: 'Number of items per page',
            displayOptions: {
                show: { operation: ['getOrders', 'getProducts'] },
            },
        },
        // Order ID for detail/accept/reject
        {
            name: 'orderId',
            displayName: 'Order ID',
            type: 'string',
            default: '',
            required: true,
            placeholder: '123456789',
            description: 'Tokopedia Order ID',
            displayOptions: {
                show: { operation: ['getOrderDetail', 'acceptOrder', 'rejectOrder', 'confirmShipping'] },
            },
        },
        // Reject reason
        {
            name: 'rejectReason',
            displayName: 'Reject Reason',
            type: 'options',
            default: '1',
            description: 'Reason for rejecting order',
            options: [
                { name: 'Out of Stock', value: '1' },
                { name: 'Product Variant Not Available', value: '2' },
                { name: 'Wrong Price or Weight', value: '3' },
                { name: 'Shop Closed', value: '4' },
            ],
            displayOptions: {
                show: { operation: ['rejectOrder'] },
            },
        },
        // Product ID
        {
            name: 'productId',
            displayName: 'Product ID',
            type: 'string',
            default: '',
            required: true,
            placeholder: '987654321',
            description: 'Tokopedia Product ID',
            displayOptions: {
                show: { operation: ['getProductInfo', 'updateStock', 'updatePrice'] },
            },
        },
        // Stock update
        {
            name: 'newStock',
            displayName: 'New Stock',
            type: 'number',
            default: 0,
            required: true,
            description: 'New stock quantity',
            displayOptions: {
                show: { operation: ['updateStock'] },
            },
        },
        // Price update
        {
            name: 'newPrice',
            displayName: 'New Price (IDR)',
            type: 'number',
            default: 0,
            required: true,
            description: 'New price in IDR',
            displayOptions: {
                show: { operation: ['updatePrice'] },
            },
        },
        // Shipping confirmation
        {
            name: 'shippingRef',
            displayName: 'Shipping Reference (AWB)',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'JNE123456789',
            description: 'Airway Bill / Resi number',
            displayOptions: {
                show: { operation: ['confirmShipping'] },
            },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.tokopediaApi as unknown as TokopediaCredentials;

        if (!creds?.clientId || !creds?.clientSecret || !creds?.shopId) {
            throw new NodeExecutionError(
                'Missing Tokopedia credentials',
                this.name,
                context.nodeId,
                { description: 'Please configure Client ID, Client Secret, and Shop ID.' }
            );
        }

        // Get access token
        const accessToken = await this.getAccessToken(context, creds);
        const baseUrl = 'https://fs.tokopedia.net';
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<TokopediaOperation>(context, 'operation', index, 'getOrders');
            let response: unknown;

            switch (operation) {
                case 'getOrders': {
                    const status = this.getParam<string>(context, 'orderStatus', index, '');
                    const fromDate = this.getParam<string>(context, 'fromDate', index, '');
                    const toDate = this.getParam<string>(context, 'toDate', index, '');
                    const page = this.getParam<number>(context, 'page', index, 1);
                    const perPage = this.getParam<number>(context, 'perPage', index, 10);

                    const params = new URLSearchParams({
                        fs_id: creds.fsId || creds.shopId,
                        shop_id: creds.shopId,
                        page: String(page),
                        per_page: String(perPage),
                    });

                    if (status) params.append('status', status);
                    if (fromDate) params.append('from_date', new Date(fromDate).getTime().toString());
                    if (toDate) params.append('to_date', new Date(toDate).getTime().toString());

                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/v2/order/list?${params}`,
                        headers,
                    });
                    break;
                }

                case 'getOrderDetail': {
                    const orderId = this.getParam<string>(context, 'orderId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/v2/fs/${creds.fsId || creds.shopId}/order?order_id=${orderId}`,
                        headers,
                    });
                    break;
                }

                case 'acceptOrder': {
                    const orderId = this.getParam<string>(context, 'orderId', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/v1/order/${orderId}/fs/${creds.fsId || creds.shopId}/ack`,
                        headers,
                    });
                    break;
                }

                case 'rejectOrder': {
                    const orderId = this.getParam<string>(context, 'orderId', index);
                    const reason = this.getParam<string>(context, 'rejectReason', index, '1');
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/v1/order/${orderId}/fs/${creds.fsId || creds.shopId}/nack`,
                        headers,
                        body: { reason_code: parseInt(reason) },
                    });
                    break;
                }

                case 'getProducts': {
                    const page = this.getParam<number>(context, 'page', index, 1);
                    const perPage = this.getParam<number>(context, 'perPage', index, 10);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/inventory/v1/fs/${creds.fsId || creds.shopId}/product/info?shop_id=${creds.shopId}&page=${page}&per_page=${perPage}`,
                        headers,
                    });
                    break;
                }

                case 'getProductInfo': {
                    const productId = this.getParam<string>(context, 'productId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/inventory/v1/fs/${creds.fsId || creds.shopId}/product/info?product_id=${productId}`,
                        headers,
                    });
                    break;
                }

                case 'updateStock': {
                    const productId = this.getParam<string>(context, 'productId', index);
                    const newStock = this.getParam<number>(context, 'newStock', index, 0);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/inventory/v1/fs/${creds.fsId || creds.shopId}/stock/update`,
                        headers,
                        body: [{
                            shop_id: parseInt(creds.shopId),
                            product_id: parseInt(productId),
                            stock: newStock,
                        }],
                    });
                    break;
                }

                case 'updatePrice': {
                    const productId = this.getParam<string>(context, 'productId', index);
                    const newPrice = this.getParam<number>(context, 'newPrice', index, 0);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/inventory/v1/fs/${creds.fsId || creds.shopId}/price/update`,
                        headers,
                        body: [{
                            shop_id: parseInt(creds.shopId),
                            product_id: parseInt(productId),
                            new_price: newPrice,
                        }],
                    });
                    break;
                }

                case 'confirmShipping': {
                    const orderId = this.getParam<string>(context, 'orderId', index);
                    const shippingRef = this.getParam<string>(context, 'shippingRef', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/v1/order/${orderId}/fs/${creds.fsId || creds.shopId}/status`,
                        headers,
                        body: {
                            order_status: 500,
                            shipping_ref_num: shippingRef,
                        },
                    });
                    break;
                }

                case 'getShopInfo': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/v1/shop/fs/${creds.fsId || creds.shopId}/shop-info?shop_id=${creds.shopId}`,
                        headers,
                    });
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            return {
                json: {
                    ...item.json,
                    tokopedia: { operation, response },
                },
            };
        });
    }

    private async getAccessToken(context: NodeExecutionContext, creds: TokopediaCredentials): Promise<string> {
        const authString = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString('base64');

        const response = await this.httpRequest(context, {
            method: 'POST',
            url: 'https://accounts.tokopedia.com/token?grant_type=client_credentials',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }) as { access_token: string };

        return response.access_token;
    }
}

export const tokopediaNode = new TokopediaNode();
