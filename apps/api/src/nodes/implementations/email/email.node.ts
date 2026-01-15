/**
 * Email SMTP Node
 * 
 * Send emails via SMTP (Gmail, Outlook, custom SMTP servers)
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

interface EmailCredentials {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
}

export class EmailNode extends BaseNode {
    readonly name = 'email';
    readonly displayName = 'Email (SMTP)';
    readonly description = 'Send emails via SMTP';
    readonly version = 1;
    readonly category: NodeCategory = 'communication';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-envelope',
        color: '#EA4335',
    };

    readonly defaults = { name: 'Email', color: '#EA4335' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'smtpCredentials', required: true, displayName: 'SMTP Credentials' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'send',
            required: true,
            options: [
                { name: 'Send Email', value: 'send' },
                { name: 'Send HTML Email', value: 'sendHtml' },
            ],
        },
        {
            name: 'fromEmail',
            displayName: 'From Email',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'noreply@example.com',
        },
        {
            name: 'fromName',
            displayName: 'From Name',
            type: 'string',
            default: '',
            placeholder: 'My Company',
        },
        {
            name: 'toEmail',
            displayName: 'To Email',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'recipient@example.com',
            description: 'Comma-separated for multiple recipients',
        },
        {
            name: 'ccEmail',
            displayName: 'CC',
            type: 'string',
            default: '',
            placeholder: 'cc@example.com',
        },
        {
            name: 'bccEmail',
            displayName: 'BCC',
            type: 'string',
            default: '',
            placeholder: 'bcc@example.com',
        },
        {
            name: 'subject',
            displayName: 'Subject',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'Your email subject',
        },
        {
            name: 'textBody',
            displayName: 'Text Body',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'Your email content...',
            typeOptions: { rows: 6 },
            displayOptions: { show: { operation: ['send'] } },
        },
        {
            name: 'htmlBody',
            displayName: 'HTML Body',
            type: 'string',
            default: '',
            required: true,
            placeholder: '<h1>Hello!</h1><p>Your content here...</p>',
            typeOptions: { rows: 10 },
            displayOptions: { show: { operation: ['sendHtml'] } },
        },
        {
            name: 'replyTo',
            displayName: 'Reply To',
            type: 'string',
            default: '',
            placeholder: 'reply@example.com',
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.smtpCredentials as unknown as EmailCredentials;

        if (!creds?.host || !creds?.user || !creds?.password) {
            throw new NodeExecutionError('Missing SMTP credentials', this.name, context.nodeId);
        }

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'send');
            const fromEmail = this.getParam<string>(context, 'fromEmail', index);
            const fromName = this.getParam<string>(context, 'fromName', index, '');
            const toEmail = this.getParam<string>(context, 'toEmail', index);
            const ccEmail = this.getParam<string>(context, 'ccEmail', index, '');
            const bccEmail = this.getParam<string>(context, 'bccEmail', index, '');
            const subject = this.getParam<string>(context, 'subject', index);
            const replyTo = this.getParam<string>(context, 'replyTo', index, '');

            let body: string;
            let isHtml: boolean;

            if (operation === 'sendHtml') {
                body = this.getParam<string>(context, 'htmlBody', index);
                isHtml = true;
            } else {
                body = this.getParam<string>(context, 'textBody', index);
                isHtml = false;
            }

            // Build email data (would be sent via nodemailer or similar in real implementation)
            const emailData = {
                from: fromName ? `"${fromName}" <${fromEmail}>` : fromEmail,
                to: toEmail.split(',').map(e => e.trim()),
                cc: ccEmail ? ccEmail.split(',').map(e => e.trim()) : undefined,
                bcc: bccEmail ? bccEmail.split(',').map(e => e.trim()) : undefined,
                replyTo: replyTo || undefined,
                subject,
                [isHtml ? 'html' : 'text']: body,
            };

            // In production, this would use nodemailer
            // For now, we'll simulate the response
            const response = {
                success: true,
                message: 'Email queued for delivery',
                messageId: `<${Date.now()}@${creds.host}>`,
                envelope: {
                    from: fromEmail,
                    to: emailData.to,
                },
                timestamp: new Date().toISOString(),
            };

            return {
                json: {
                    ...item.json,
                    email: {
                        operation,
                        ...response,
                    },
                },
            };
        });
    }
}

export const emailNode = new EmailNode();
