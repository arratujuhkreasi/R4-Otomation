/**
 * WhatsApp Business API Node
 * 
 * A comprehensive integration node for WhatsApp Business Cloud API.
 * Supports sending text, media, templates, and interactive messages.
 * 
 * ============================================================
 * HOW TO GET YOUR WHATSAPP BUSINESS API CREDENTIALS:
 * ============================================================
 * 
 * 1. Go to https://developers.facebook.com/ and log in
 * 2. Click "My Apps" → "Create App"
 * 3. Select "Business" as app type
 * 4. Add "WhatsApp" product to your app
 * 5. Navigate to WhatsApp → API Setup
 * 6. You'll find:
 *    - Phone Number ID: Under "From" phone number
 *    - Access Token: Click "Generate" (temporary) or create System User token (permanent)
 * 
 * For Production:
 * 1. Complete business verification
 * 2. Register a real phone number
 * 3. Create a System User with permissions and generate permanent token
 * 
 * API Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
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
import {
    WhatsAppCredentials,
    WhatsAppOperation,
    WhatsAppTextMessage,
    WhatsAppMediaMessage,
    WhatsAppLocationMessage,
    WhatsAppTemplateMessage,
    WhatsAppInteractiveMessage,
} from './whatsapp.types';

/**
 * WhatsApp Business API Node
 * 
 * Provides full integration with WhatsApp Business Cloud API
 * including sending messages, media, templates, and interactive content.
 */
export class WhatsAppNode extends BaseNode {
    // ============================================================
    // NODE METADATA
    // ============================================================

    readonly name = 'whatsapp';
    readonly displayName = 'WhatsApp Business';
    readonly description = 'Send messages, media, and templates via WhatsApp Business Cloud API';
    readonly version = 1;
    readonly category: NodeCategory = 'communication';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-whatsapp',
        color: '#25D366',
    };

    readonly defaults = {
        name: 'WhatsApp',
        color: '#25D366',
    };

    readonly credentials: NodeCredentialRequirement[] = [
        {
            name: 'whatsappApi',
            required: true,
            displayName: 'WhatsApp Business API',
        },
    ];

    // ============================================================
    // NODE PROPERTIES (UI CONFIGURATION)
    // ============================================================

    readonly properties: NodeProperty[] = [
        // Operation selector
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'sendText',
            required: true,
            description: 'The operation to perform',
            options: [
                { name: 'Send Text Message', value: 'sendText', description: 'Send a plain text message' },
                { name: 'Send Image', value: 'sendImage', description: 'Send an image with optional caption' },
                { name: 'Send Document', value: 'sendDocument', description: 'Send a document/file' },
                { name: 'Send Audio', value: 'sendAudio', description: 'Send an audio file' },
                { name: 'Send Video', value: 'sendVideo', description: 'Send a video file' },
                { name: 'Send Location', value: 'sendLocation', description: 'Send a location pin' },
                { name: 'Send Template', value: 'sendTemplate', description: 'Send a pre-approved template message' },
                { name: 'Send Interactive', value: 'sendInteractive', description: 'Send buttons or list message' },
                { name: 'Mark as Read', value: 'markAsRead', description: 'Mark a message as read' },
            ],
        },

        // Recipient phone number
        {
            name: 'recipientPhone',
            displayName: 'Recipient Phone Number',
            type: 'string',
            default: '',
            required: true,
            placeholder: '6281234567890',
            description: 'Phone number in international format without + (e.g., 6281234567890 for Indonesia)',
        },

        // ============================================================
        // TEXT MESSAGE PROPERTIES
        // ============================================================
        {
            name: 'messageText',
            displayName: 'Message Text',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'Hello! This is a message from FlowAutomator.',
            description: 'The text message to send (max 4096 characters)',
            displayOptions: {
                show: { operation: ['sendText'] },
            },
            typeOptions: {
                rows: 4,
            },
        },
        {
            name: 'previewUrl',
            displayName: 'Preview URL',
            type: 'boolean',
            default: false,
            description: 'Enable link preview if message contains a URL',
            displayOptions: {
                show: { operation: ['sendText'] },
            },
        },

        // ============================================================
        // MEDIA PROPERTIES (Image, Document, Audio, Video)
        // ============================================================
        {
            name: 'mediaSource',
            displayName: 'Media Source',
            type: 'options',
            default: 'url',
            description: 'Where to get the media from',
            options: [
                { name: 'URL', value: 'url', description: 'Provide a public URL' },
                { name: 'Media ID', value: 'id', description: 'Use an uploaded media ID' },
            ],
            displayOptions: {
                show: { operation: ['sendImage', 'sendDocument', 'sendAudio', 'sendVideo'] },
            },
        },
        {
            name: 'mediaUrl',
            displayName: 'Media URL',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'https://example.com/image.jpg',
            description: 'Public URL of the media file',
            displayOptions: {
                show: {
                    operation: ['sendImage', 'sendDocument', 'sendAudio', 'sendVideo'],
                    mediaSource: ['url'],
                },
            },
        },
        {
            name: 'mediaId',
            displayName: 'Media ID',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'media_id_from_upload',
            description: 'Media ID from a previous upload',
            displayOptions: {
                show: {
                    operation: ['sendImage', 'sendDocument', 'sendAudio', 'sendVideo'],
                    mediaSource: ['id'],
                },
            },
        },
        {
            name: 'caption',
            displayName: 'Caption',
            type: 'string',
            default: '',
            placeholder: 'Check out this file!',
            description: 'Optional caption for the media',
            displayOptions: {
                show: { operation: ['sendImage', 'sendDocument', 'sendVideo'] },
            },
        },
        {
            name: 'filename',
            displayName: 'Filename',
            type: 'string',
            default: '',
            placeholder: 'document.pdf',
            description: 'Filename for the document',
            displayOptions: {
                show: { operation: ['sendDocument'] },
            },
        },

        // ============================================================
        // LOCATION PROPERTIES
        // ============================================================
        {
            name: 'latitude',
            displayName: 'Latitude',
            type: 'number',
            default: 0,
            required: true,
            placeholder: '-6.200000',
            description: 'Latitude of the location',
            displayOptions: {
                show: { operation: ['sendLocation'] },
            },
        },
        {
            name: 'longitude',
            displayName: 'Longitude',
            type: 'number',
            default: 0,
            required: true,
            placeholder: '106.816666',
            description: 'Longitude of the location',
            displayOptions: {
                show: { operation: ['sendLocation'] },
            },
        },
        {
            name: 'locationName',
            displayName: 'Location Name',
            type: 'string',
            default: '',
            placeholder: 'Jakarta Office',
            description: 'Name of the location',
            displayOptions: {
                show: { operation: ['sendLocation'] },
            },
        },
        {
            name: 'locationAddress',
            displayName: 'Address',
            type: 'string',
            default: '',
            placeholder: 'Jl. Sudirman No. 1, Jakarta',
            description: 'Address of the location',
            displayOptions: {
                show: { operation: ['sendLocation'] },
            },
        },

        // ============================================================
        // TEMPLATE PROPERTIES
        // ============================================================
        {
            name: 'templateName',
            displayName: 'Template Name',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'hello_world',
            description: 'Name of the approved message template',
            displayOptions: {
                show: { operation: ['sendTemplate'] },
            },
        },
        {
            name: 'templateLanguage',
            displayName: 'Template Language',
            type: 'string',
            default: 'en',
            required: true,
            placeholder: 'en',
            description: 'Language code of the template (e.g., en, id, es)',
            displayOptions: {
                show: { operation: ['sendTemplate'] },
            },
        },
        {
            name: 'templateVariables',
            displayName: 'Template Variables',
            type: 'json',
            default: '[]',
            placeholder: '["John", "Order #123"]',
            description: 'Array of variable values for the template placeholders',
            displayOptions: {
                show: { operation: ['sendTemplate'] },
            },
        },

        // ============================================================
        // INTERACTIVE MESSAGE PROPERTIES
        // ============================================================
        {
            name: 'interactiveType',
            displayName: 'Interactive Type',
            type: 'options',
            default: 'button',
            description: 'Type of interactive message',
            options: [
                { name: 'Buttons (Max 3)', value: 'button' },
                { name: 'List Menu', value: 'list' },
            ],
            displayOptions: {
                show: { operation: ['sendInteractive'] },
            },
        },
        {
            name: 'interactiveBody',
            displayName: 'Body Text',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'Please select an option:',
            description: 'Main text content of the interactive message',
            displayOptions: {
                show: { operation: ['sendInteractive'] },
            },
            typeOptions: {
                rows: 3,
            },
        },
        {
            name: 'interactiveFooter',
            displayName: 'Footer Text',
            type: 'string',
            default: '',
            placeholder: 'Powered by FlowAutomator',
            description: 'Optional footer text',
            displayOptions: {
                show: { operation: ['sendInteractive'] },
            },
        },
        {
            name: 'buttons',
            displayName: 'Buttons (JSON)',
            type: 'json',
            default: '[{"id": "btn1", "title": "Option 1"}, {"id": "btn2", "title": "Option 2"}]',
            description: 'Array of button objects with id and title (max 3 buttons, max 20 chars per title)',
            displayOptions: {
                show: {
                    operation: ['sendInteractive'],
                    interactiveType: ['button'],
                },
            },
        },
        {
            name: 'listButtonText',
            displayName: 'List Button Text',
            type: 'string',
            default: 'View Options',
            placeholder: 'View Options',
            description: 'Text shown on the list button (max 20 characters)',
            displayOptions: {
                show: {
                    operation: ['sendInteractive'],
                    interactiveType: ['list'],
                },
            },
        },
        {
            name: 'listSections',
            displayName: 'List Sections (JSON)',
            type: 'json',
            default: '[{"title": "Section 1", "rows": [{"id": "row1", "title": "Item 1", "description": "Description"}]}]',
            description: 'Array of section objects with title and rows',
            displayOptions: {
                show: {
                    operation: ['sendInteractive'],
                    interactiveType: ['list'],
                },
            },
        },

        // ============================================================
        // MARK AS READ PROPERTIES
        // ============================================================
        {
            name: 'messageId',
            displayName: 'Message ID',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'wamid.xxx',
            description: 'ID of the message to mark as read',
            displayOptions: {
                show: { operation: ['markAsRead'] },
            },
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
        // Get WhatsApp credentials
        const whatsappCreds = credentials?.whatsappApi as unknown as WhatsAppCredentials;

        if (!whatsappCreds?.accessToken || !whatsappCreds?.phoneNumberId) {
            throw new NodeExecutionError(
                'Missing WhatsApp credentials',
                this.name,
                context.nodeId,
                {
                    description: 'Please configure your WhatsApp Business API credentials with Access Token and Phone Number ID.',
                }
            );
        }

        const baseUrl = `https://graph.facebook.com/v18.0/${whatsappCreds.phoneNumberId}`;
        const headers = {
            'Authorization': `Bearer ${whatsappCreds.accessToken}`,
            'Content-Type': 'application/json',
        };

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<WhatsAppOperation>(context, 'operation', index, 'sendText');
            const recipientPhone = this.getParam<string>(context, 'recipientPhone', index);

            let endpoint = '/messages';
            let body: Record<string, unknown>;

            switch (operation) {
                case 'sendText':
                    body = this.buildTextMessage(context, index, recipientPhone) as unknown as Record<string, unknown>;
                    break;

                case 'sendImage':
                case 'sendDocument':
                case 'sendAudio':
                case 'sendVideo':
                    body = this.buildMediaMessage(context, index, recipientPhone, operation) as unknown as Record<string, unknown>;
                    break;

                case 'sendLocation':
                    body = this.buildLocationMessage(context, index, recipientPhone) as unknown as Record<string, unknown>;
                    break;

                case 'sendTemplate':
                    body = this.buildTemplateMessage(context, index, recipientPhone) as unknown as Record<string, unknown>;
                    break;

                case 'sendInteractive':
                    body = this.buildInteractiveMessage(context, index, recipientPhone) as unknown as Record<string, unknown>;
                    break;

                case 'markAsRead':
                    body = {
                        messaging_product: 'whatsapp',
                        status: 'read',
                        message_id: this.getParam<string>(context, 'messageId', index),
                    };
                    break;

                default:
                    throw new NodeExecutionError(
                        `Unknown operation: ${operation}`,
                        this.name,
                        context.nodeId
                    );
            }

            // Make the API call
            const response = await this.httpRequest(context, {
                method: 'POST',
                url: `${baseUrl}${endpoint}`,
                headers,
                body,
            });

            return {
                json: {
                    ...item.json,
                    whatsapp: {
                        operation,
                        recipient: recipientPhone,
                        response,
                    },
                },
            };
        });
    }

    // ============================================================
    // MESSAGE BUILDERS
    // ============================================================

    private buildTextMessage(
        context: NodeExecutionContext,
        index: number,
        recipient: string
    ): WhatsAppTextMessage {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'text',
            text: {
                preview_url: this.getParam<boolean>(context, 'previewUrl', index, false),
                body: this.getParam<string>(context, 'messageText', index),
            },
        };
    }

    private buildMediaMessage(
        context: NodeExecutionContext,
        index: number,
        recipient: string,
        operation: string
    ): WhatsAppMediaMessage {
        const mediaType = operation.replace('send', '').toLowerCase() as 'image' | 'document' | 'audio' | 'video';
        const mediaSource = this.getParam<string>(context, 'mediaSource', index, 'url');

        const mediaObject: Record<string, unknown> = {};

        if (mediaSource === 'url') {
            mediaObject.link = this.getParam<string>(context, 'mediaUrl', index);
        } else {
            mediaObject.id = this.getParam<string>(context, 'mediaId', index);
        }

        // Add caption for image, document, video
        if (['image', 'document', 'video'].includes(mediaType)) {
            const caption = this.getParam<string>(context, 'caption', index, '');
            if (caption) {
                mediaObject.caption = caption;
            }
        }

        // Add filename for documents
        if (mediaType === 'document') {
            const filename = this.getParam<string>(context, 'filename', index, '');
            if (filename) {
                mediaObject.filename = filename;
            }
        }

        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: mediaType,
            [mediaType]: mediaObject,
        } as WhatsAppMediaMessage;
    }

    private buildLocationMessage(
        context: NodeExecutionContext,
        index: number,
        recipient: string
    ): WhatsAppLocationMessage {
        return {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'location',
            location: {
                latitude: this.getParam<number>(context, 'latitude', index),
                longitude: this.getParam<number>(context, 'longitude', index),
                name: this.getParam<string>(context, 'locationName', index, ''),
                address: this.getParam<string>(context, 'locationAddress', index, ''),
            },
        };
    }

    private buildTemplateMessage(
        context: NodeExecutionContext,
        index: number,
        recipient: string
    ): WhatsAppTemplateMessage {
        const templateName = this.getParam<string>(context, 'templateName', index);
        const templateLanguage = this.getParam<string>(context, 'templateLanguage', index, 'en');
        const variablesJson = this.getParam<string>(context, 'templateVariables', index, '[]');

        let variables: string[] = [];
        try {
            variables = JSON.parse(variablesJson);
        } catch (e) {
            // Keep empty array if parse fails
        }

        const message: WhatsAppTemplateMessage = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: templateLanguage,
                },
            },
        };

        // Add variables as body components if provided
        if (variables.length > 0) {
            message.template.components = [
                {
                    type: 'body',
                    parameters: variables.map(value => ({
                        type: 'text',
                        text: value,
                    })),
                },
            ];
        }

        return message;
    }

    private buildInteractiveMessage(
        context: NodeExecutionContext,
        index: number,
        recipient: string
    ): WhatsAppInteractiveMessage {
        const interactiveType = this.getParam<string>(context, 'interactiveType', index, 'button') as 'button' | 'list';
        const bodyText = this.getParam<string>(context, 'interactiveBody', index);
        const footerText = this.getParam<string>(context, 'interactiveFooter', index, '');

        const message: WhatsAppInteractiveMessage = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: recipient,
            type: 'interactive',
            interactive: {
                type: interactiveType,
                body: {
                    text: bodyText,
                },
                action: {},
            },
        };

        if (footerText) {
            message.interactive.footer = { text: footerText };
        }

        if (interactiveType === 'button') {
            const buttonsJson = this.getParam<string>(context, 'buttons', index, '[]');
            let buttons: Array<{ id: string; title: string }> = [];

            try {
                buttons = JSON.parse(buttonsJson);
            } catch (e) {
                buttons = [];
            }

            message.interactive.action.buttons = buttons.slice(0, 3).map(btn => ({
                type: 'reply' as const,
                reply: {
                    id: btn.id,
                    title: btn.title.substring(0, 20), // Max 20 chars
                },
            }));
        } else if (interactiveType === 'list') {
            const listButtonText = this.getParam<string>(context, 'listButtonText', index, 'View Options');
            const sectionsJson = this.getParam<string>(context, 'listSections', index, '[]');

            let sections: Array<{
                title: string;
                rows: Array<{ id: string; title: string; description?: string }>;
            }> = [];

            try {
                sections = JSON.parse(sectionsJson);
            } catch (e) {
                sections = [];
            }

            message.interactive.action.button = listButtonText.substring(0, 20);
            message.interactive.action.sections = sections;
        }

        return message;
    }
}

// Export singleton instance
export const whatsappNode = new WhatsAppNode();
