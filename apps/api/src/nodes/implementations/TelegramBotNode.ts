/**
 * Telegram Bot Node
 * 
 * A node that sends messages to Telegram chats.
 * Demonstrates credential usage and API integration.
 */

import { BaseNode } from '../BaseNode';
import {
    NodeCategory,
    NodeCredentialRequirement,
    NodeCredentials,
    NodeExecutionContext,
    NodeInputData,
    NodeOutputData,
    NodeProperty,
} from '../Node.interface';

export class TelegramBotNode extends BaseNode {
    // ============================================================
    // NODE METADATA
    // ============================================================

    readonly name = 'telegram-bot';
    readonly displayName = 'Telegram Bot';
    readonly description = 'Send messages, photos, and documents via Telegram Bot API';
    readonly version = 1;
    readonly category: NodeCategory = 'communication';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-telegram',
        color: '#0088cc',
    };

    readonly defaults = {
        name: 'Telegram',
        color: '#0088cc',
    };

    readonly credentials: NodeCredentialRequirement[] = [
        {
            name: 'telegramApi',
            required: true,
            displayName: 'Telegram Bot API',
        },
    ];

    // ============================================================
    // NODE PROPERTIES
    // ============================================================

    readonly properties: NodeProperty[] = [
        {
            name: 'resource',
            displayName: 'Resource',
            type: 'options',
            default: 'message',
            required: true,
            description: 'The Telegram resource to use',
            options: [
                { name: 'Message', value: 'message' },
                { name: 'Chat', value: 'chat' },
                { name: 'File', value: 'file' },
            ],
        },
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'sendMessage',
            required: true,
            description: 'The operation to perform',
            options: [
                { name: 'Send Message', value: 'sendMessage' },
                { name: 'Send Photo', value: 'sendPhoto' },
                { name: 'Send Document', value: 'sendDocument' },
                { name: 'Edit Message', value: 'editMessage' },
                { name: 'Delete Message', value: 'deleteMessage' },
            ],
            displayOptions: {
                show: { resource: ['message'] },
            },
        },
        {
            name: 'chatId',
            displayName: 'Chat ID',
            type: 'string',
            default: '',
            required: true,
            placeholder: '-1001234567890',
            description: 'The ID of the chat to send the message to',
        },
        {
            name: 'text',
            displayName: 'Text',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'Hello from FlowAutomator!',
            description: 'The message text to send',
            displayOptions: {
                show: { operation: ['sendMessage', 'editMessage'] },
            },
            typeOptions: {
                rows: 4,
            },
        },
        {
            name: 'parseMode',
            displayName: 'Parse Mode',
            type: 'options',
            default: 'Markdown',
            description: 'How to parse the message text',
            options: [
                { name: 'None', value: '' },
                { name: 'Markdown', value: 'Markdown' },
                { name: 'MarkdownV2', value: 'MarkdownV2' },
                { name: 'HTML', value: 'HTML' },
            ],
            displayOptions: {
                show: { operation: ['sendMessage', 'editMessage'] },
            },
        },
        {
            name: 'disableNotification',
            displayName: 'Disable Notification',
            type: 'boolean',
            default: false,
            description: 'Send the message silently',
        },
        {
            name: 'replyToMessageId',
            displayName: 'Reply To Message ID',
            type: 'number',
            default: 0,
            description: 'ID of the message to reply to (0 for no reply)',
        },
    ];

    // ============================================================
    // NODE EXECUTION
    // ============================================================

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        // Get Telegram credentials
        const telegramCreds = credentials?.telegramApi as {
            botToken: string;
        };

        if (!telegramCreds?.botToken) {
            throw new Error('Telegram Bot Token is required');
        }

        const baseUrl = `https://api.telegram.org/bot${telegramCreds.botToken}`;

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'sendMessage');
            const chatId = this.getParam<string>(context, 'chatId', index);
            const text = this.getParam<string>(context, 'text', index);
            const parseMode = this.getParam<string>(context, 'parseMode', index, 'Markdown');
            const disableNotification = this.getParam<boolean>(context, 'disableNotification', index, false);
            const replyToMessageId = this.getParam<number>(context, 'replyToMessageId', index, 0);

            let endpoint = '';
            const body: Record<string, unknown> = {
                chat_id: chatId,
                disable_notification: disableNotification,
            };

            if (replyToMessageId > 0) {
                body.reply_to_message_id = replyToMessageId;
            }

            switch (operation) {
                case 'sendMessage':
                    endpoint = '/sendMessage';
                    body.text = text;
                    if (parseMode) {
                        body.parse_mode = parseMode;
                    }
                    break;

                case 'sendPhoto':
                    endpoint = '/sendPhoto';
                    body.photo = this.getParam<string>(context, 'photoUrl', index);
                    body.caption = text;
                    break;

                case 'sendDocument':
                    endpoint = '/sendDocument';
                    body.document = this.getParam<string>(context, 'documentUrl', index);
                    body.caption = text;
                    break;

                case 'editMessage':
                    endpoint = '/editMessageText';
                    body.message_id = this.getParam<number>(context, 'messageId', index);
                    body.text = text;
                    if (parseMode) {
                        body.parse_mode = parseMode;
                    }
                    break;

                case 'deleteMessage':
                    endpoint = '/deleteMessage';
                    body.message_id = this.getParam<number>(context, 'messageId', index);
                    break;

                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            // Make the API call
            const response = await this.httpRequest(context, {
                method: 'POST',
                url: `${baseUrl}${endpoint}`,
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });

            return {
                json: {
                    ...item.json,
                    telegram: response,
                },
            };
        });
    }
}

// Export singleton instance
export const telegramBotNode = new TelegramBotNode();
