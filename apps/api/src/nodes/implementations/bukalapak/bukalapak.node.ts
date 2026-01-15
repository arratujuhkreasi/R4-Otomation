/**
 * Bukalapak API Node
 * 
 * ============================================================
 * HOW TO GET BUKALAPAK API CREDENTIALS:
 * ============================================================
 * 
 * 1. Daftar di https://developer.bukalapak.com/
 * 2. Buat aplikasi baru
 * 3. Dapatkan Client ID dan Client Secret
 * 4. Gunakan OAuth untuk mendapatkan Access Token
 * 
 * API Documentation: https://developer.bukalapak.com/documentation
 * ============================================================
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

interface BukalapakCredentials {
    accessToken: string;
    userId: string;
}

export class BukalapakNode extends BaseNode {
    readonly name = 'bukalapak';
    readonly displayName = 'Bukalapak';
    readonly description = 'Manage products and transactions on Bukalapak marketplace';
    readonly version = 1;
    readonly category: NodeCategory = 'action';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-shopping-bag',
        color: '#E31E52',
    };

    readonly defaults = { name: 'Bukalapak', color: '#E31E52' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'bukalapakApi', required: true, displayName: 'Bukalapak API' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'getTransactions',
            required: true,
            options: [
                { name: 'Get Transactions', value: 'getTransactions' },
                { name: 'Get Transaction Detail', value: 'getTransactionDetail' },
                { name: 'Confirm Shipping', value: 'confirmShipping' },
                { name: 'Get Products', value: 'getProducts' },
                { name: 'Get Product Detail', value: 'getProductDetail' },
                { name: 'Update Stock', value: 'updateStock' },
                { name: 'Get Shop Info', value: 'getShopInfo' },
            ],
        },
        {
            name: 'transactionId',
            displayName: 'Transaction ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['getTransactionDetail', 'confirmShipping'] } },
        },
        {
            name: 'productId',
            displayName: 'Product ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['getProductDetail', 'updateStock'] } },
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
            name: 'shippingCode',
            displayName: 'Shipping Code (Resi)',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['confirmShipping'] } },
        },
        {
            name: 'page',
            displayName: 'Page',
            type: 'number',
            default: 1,
            displayOptions: { show: { operation: ['getTransactions', 'getProducts'] } },
        },
        {
            name: 'perPage',
            displayName: 'Per Page',
            type: 'number',
            default: 20,
            displayOptions: { show: { operation: ['getTransactions', 'getProducts'] } },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.bukalapakApi as unknown as BukalapakCredentials;

        if (!creds?.accessToken) {
            throw new NodeExecutionError('Missing Bukalapak credentials', this.name, context.nodeId);
        }

        const baseUrl = 'https://api.bukalapak.com';
        const headers = {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
        };

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'getTransactions');
            let response: unknown;

            switch (operation) {
                case 'getTransactions': {
                    const page = this.getParam<number>(context, 'page', index, 1);
                    const perPage = this.getParam<number>(context, 'perPage', index, 20);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/transactions?page=${page}&per_page=${perPage}`,
                        headers,
                    });
                    break;
                }

                case 'getTransactionDetail': {
                    const transactionId = this.getParam<string>(context, 'transactionId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/transactions/${transactionId}`,
                        headers,
                    });
                    break;
                }

                case 'confirmShipping': {
                    const transactionId = this.getParam<string>(context, 'transactionId', index);
                    const shippingCode = this.getParam<string>(context, 'shippingCode', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/transactions/${transactionId}/confirm_shipping`,
                        headers,
                        body: { shipping_code: shippingCode },
                    });
                    break;
                }

                case 'getProducts': {
                    const page = this.getParam<number>(context, 'page', index, 1);
                    const perPage = this.getParam<number>(context, 'perPage', index, 20);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/products?page=${page}&per_page=${perPage}`,
                        headers,
                    });
                    break;
                }

                case 'getProductDetail': {
                    const productId = this.getParam<string>(context, 'productId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/products/${productId}`,
                        headers,
                    });
                    break;
                }

                case 'updateStock': {
                    const productId = this.getParam<string>(context, 'productId', index);
                    const newStock = this.getParam<number>(context, 'newStock', index, 0);
                    response = await this.httpRequest(context, {
                        method: 'PATCH',
                        url: `${baseUrl}/products/${productId}`,
                        headers,
                        body: { stock: newStock },
                    });
                    break;
                }

                case 'getShopInfo': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/users/${creds.userId}/store`,
                        headers,
                    });
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            return { json: { ...item.json, bukalapak: { operation, response } } };
        });
    }
}

export const bukalapakNode = new BukalapakNode();
