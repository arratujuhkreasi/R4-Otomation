/**
 * WhatsApp Node Types
 * 
 * Type definitions for WhatsApp Business API integration.
 * 
 * ============================================================
 * HOW TO GET YOUR WHATSAPP BUSINESS API CREDENTIALS:
 * ============================================================
 * 
 * 1. Go to https://developers.facebook.com/
 * 2. Create a new App or use an existing one
 * 3. Add "WhatsApp" product to your app
 * 4. Go to WhatsApp > Getting Started
 * 5. You'll get:
 *    - Phone Number ID: Found in the WhatsApp dashboard
 *    - Access Token: Generate from the API Setup section
 *    - Business Account ID: Found in the WhatsApp Business settings
 * 
 * For production, you need to:
 * 1. Verify your business
 * 2. Add a phone number
 * 3. Create a permanent access token via System User
 * 
 * API Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api
 * ============================================================
 */

/**
 * WhatsApp API credentials structure
 */
export interface WhatsAppCredentials {
    /** Access token from Meta Business Suite */
    accessToken: string;

    /** Phone Number ID from WhatsApp Business API */
    phoneNumberId: string;

    /** WhatsApp Business Account ID */
    businessAccountId?: string;
}

/**
 * WhatsApp message types
 */
export type WhatsAppMessageType =
    | 'text'
    | 'image'
    | 'document'
    | 'audio'
    | 'video'
    | 'sticker'
    | 'location'
    | 'contacts'
    | 'template'
    | 'interactive';

/**
 * WhatsApp operations
 */
export type WhatsAppOperation =
    | 'sendText'
    | 'sendImage'
    | 'sendDocument'
    | 'sendAudio'
    | 'sendVideo'
    | 'sendLocation'
    | 'sendTemplate'
    | 'sendInteractive'
    | 'markAsRead'
    | 'getMediaUrl';

/**
 * WhatsApp text message
 */
export interface WhatsAppTextMessage {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'text';
    text: {
        preview_url?: boolean;
        body: string;
    };
}

/**
 * WhatsApp media message (image, document, audio, video)
 */
export interface WhatsAppMediaMessage {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'image' | 'document' | 'audio' | 'video';
    [key: string]: {
        link?: string;
        id?: string;
        caption?: string;
        filename?: string;
    } | string;
}

/**
 * WhatsApp location message
 */
export interface WhatsAppLocationMessage {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'location';
    location: {
        longitude: number;
        latitude: number;
        name?: string;
        address?: string;
    };
}

/**
 * WhatsApp template message
 */
export interface WhatsAppTemplateMessage {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'template';
    template: {
        name: string;
        language: {
            code: string;
        };
        components?: Array<{
            type: 'header' | 'body' | 'button';
            parameters: Array<{
                type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
                text?: string;
                [key: string]: unknown;
            }>;
        }>;
    };
}

/**
 * WhatsApp interactive message (buttons, lists)
 */
export interface WhatsAppInteractiveMessage {
    messaging_product: 'whatsapp';
    recipient_type: 'individual';
    to: string;
    type: 'interactive';
    interactive: {
        type: 'button' | 'list' | 'product' | 'product_list';
        header?: {
            type: 'text' | 'image' | 'video' | 'document';
            text?: string;
            [key: string]: unknown;
        };
        body: {
            text: string;
        };
        footer?: {
            text: string;
        };
        action: {
            buttons?: Array<{
                type: 'reply';
                reply: {
                    id: string;
                    title: string;
                };
            }>;
            button?: string;
            sections?: Array<{
                title: string;
                rows: Array<{
                    id: string;
                    title: string;
                    description?: string;
                }>;
            }>;
        };
    };
}

/**
 * WhatsApp API response
 */
export interface WhatsAppApiResponse {
    messaging_product: 'whatsapp';
    contacts: Array<{
        input: string;
        wa_id: string;
    }>;
    messages: Array<{
        id: string;
    }>;
}

/**
 * WhatsApp error response
 */
export interface WhatsAppErrorResponse {
    error: {
        message: string;
        type: string;
        code: number;
        error_subcode?: number;
        fbtrace_id: string;
    };
}
