/**
 * Google Sheets Node
 * 
 * ============================================================
 * HOW TO GET GOOGLE SHEETS API CREDENTIALS:
 * ============================================================
 * 
 * 1. Buka https://console.cloud.google.com/
 * 2. Buat project baru atau pilih yang ada
 * 3. Enable Google Sheets API
 * 4. Buat credentials (OAuth 2.0 atau Service Account)
 * 5. Untuk Service Account: Download JSON key
 * 6. Share spreadsheet dengan email service account
 * 
 * API Documentation: https://developers.google.com/sheets/api
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

interface GoogleSheetsCredentials {
    accessToken: string;
}

export class GoogleSheetsNode extends BaseNode {
    readonly name = 'google-sheets';
    readonly displayName = 'Google Sheets';
    readonly description = 'Read and write data to Google Sheets';
    readonly version = 1;
    readonly category: NodeCategory = 'data';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-table',
        color: '#0F9D58',
    };

    readonly defaults = { name: 'Google Sheets', color: '#0F9D58' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'googleSheetsApi', required: true, displayName: 'Google Sheets API' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'readRows',
            required: true,
            options: [
                { name: 'Read Rows', value: 'readRows' },
                { name: 'Append Row', value: 'appendRow' },
                { name: 'Update Row', value: 'updateRow' },
                { name: 'Delete Row', value: 'deleteRow' },
                { name: 'Get Spreadsheet Info', value: 'getSpreadsheet' },
                { name: 'Create Spreadsheet', value: 'createSpreadsheet' },
            ],
        },
        {
            name: 'spreadsheetId',
            displayName: 'Spreadsheet ID',
            type: 'string',
            default: '',
            required: true,
            placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
            description: 'The ID from the spreadsheet URL',
            displayOptions: { show: { operation: ['readRows', 'appendRow', 'updateRow', 'deleteRow', 'getSpreadsheet'] } },
        },
        {
            name: 'sheetName',
            displayName: 'Sheet Name',
            type: 'string',
            default: 'Sheet1',
            placeholder: 'Sheet1',
            displayOptions: { show: { operation: ['readRows', 'appendRow', 'updateRow', 'deleteRow'] } },
        },
        {
            name: 'range',
            displayName: 'Range',
            type: 'string',
            default: 'A1:Z100',
            placeholder: 'A1:Z100',
            description: 'The A1 notation range',
            displayOptions: { show: { operation: ['readRows'] } },
        },
        {
            name: 'rowData',
            displayName: 'Row Data (JSON)',
            type: 'json',
            default: '["Column1", "Column2", "Column3"]',
            description: 'Array of values for the row',
            displayOptions: { show: { operation: ['appendRow', 'updateRow'] } },
        },
        {
            name: 'rowNumber',
            displayName: 'Row Number',
            type: 'number',
            default: 1,
            description: 'The row number to update or delete',
            displayOptions: { show: { operation: ['updateRow', 'deleteRow'] } },
        },
        {
            name: 'newSpreadsheetTitle',
            displayName: 'Spreadsheet Title',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'My New Spreadsheet',
            displayOptions: { show: { operation: ['createSpreadsheet'] } },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.googleSheetsApi as unknown as GoogleSheetsCredentials;

        if (!creds?.accessToken) {
            throw new NodeExecutionError('Missing Google credentials', this.name, context.nodeId);
        }

        const baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
        const headers = {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
        };

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'readRows');
            let response: unknown;

            switch (operation) {
                case 'readRows': {
                    const spreadsheetId = this.getParam<string>(context, 'spreadsheetId', index);
                    const sheetName = this.getParam<string>(context, 'sheetName', index, 'Sheet1');
                    const range = this.getParam<string>(context, 'range', index, 'A1:Z100');

                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${spreadsheetId}/values/${sheetName}!${range}`,
                        headers,
                    });
                    break;
                }

                case 'appendRow': {
                    const spreadsheetId = this.getParam<string>(context, 'spreadsheetId', index);
                    const sheetName = this.getParam<string>(context, 'sheetName', index, 'Sheet1');
                    const rowDataJson = this.getParam<string>(context, 'rowData', index, '[]');
                    const rowData = JSON.parse(rowDataJson);

                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`,
                        headers,
                        body: { values: [rowData] },
                    });
                    break;
                }

                case 'updateRow': {
                    const spreadsheetId = this.getParam<string>(context, 'spreadsheetId', index);
                    const sheetName = this.getParam<string>(context, 'sheetName', index, 'Sheet1');
                    const rowNumber = this.getParam<number>(context, 'rowNumber', index, 1);
                    const rowDataJson = this.getParam<string>(context, 'rowData', index, '[]');
                    const rowData = JSON.parse(rowDataJson);

                    response = await this.httpRequest(context, {
                        method: 'PUT',
                        url: `${baseUrl}/${spreadsheetId}/values/${sheetName}!A${rowNumber}:Z${rowNumber}?valueInputOption=USER_ENTERED`,
                        headers,
                        body: { values: [rowData] },
                    });
                    break;
                }

                case 'deleteRow': {
                    const spreadsheetId = this.getParam<string>(context, 'spreadsheetId', index);
                    const sheetName = this.getParam<string>(context, 'sheetName', index, 'Sheet1');
                    const rowNumber = this.getParam<number>(context, 'rowNumber', index, 1);

                    // Get sheet ID first
                    const spreadsheet = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${spreadsheetId}`,
                        headers,
                    }) as { sheets: Array<{ properties: { sheetId: number; title: string } }> };

                    const sheet = spreadsheet.sheets.find(s => s.properties.title === sheetName);
                    if (!sheet) throw new NodeExecutionError(`Sheet "${sheetName}" not found`, this.name, context.nodeId);

                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${spreadsheetId}:batchUpdate`,
                        headers,
                        body: {
                            requests: [{
                                deleteDimension: {
                                    range: {
                                        sheetId: sheet.properties.sheetId,
                                        dimension: 'ROWS',
                                        startIndex: rowNumber - 1,
                                        endIndex: rowNumber,
                                    },
                                },
                            }],
                        },
                    });
                    break;
                }

                case 'getSpreadsheet': {
                    const spreadsheetId = this.getParam<string>(context, 'spreadsheetId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${spreadsheetId}`,
                        headers,
                    });
                    break;
                }

                case 'createSpreadsheet': {
                    const title = this.getParam<string>(context, 'newSpreadsheetTitle', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: baseUrl,
                        headers,
                        body: {
                            properties: { title },
                            sheets: [{ properties: { title: 'Sheet1' } }],
                        },
                    });
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            return { json: { ...item.json, googleSheets: { operation, response } } };
        });
    }
}

export const googleSheetsNode = new GoogleSheetsNode();
