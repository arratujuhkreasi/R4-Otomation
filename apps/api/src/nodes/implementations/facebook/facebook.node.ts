/**
 * Facebook Graph API Node
 * 
 * ============================================================
 * HOW TO GET FACEBOOK API CREDENTIALS:
 * ============================================================
 * 
 * 1. Buka https://developers.facebook.com/
 * 2. Buat aplikasi baru
 * 3. Tambahkan product "Facebook Login" dan "Pages API"
 * 4. Generate Page Access Token dengan permissions:
 *    - pages_manage_posts
 *    - pages_read_engagement
 *    - pages_manage_engagement
 * 
 * API Documentation: https://developers.facebook.com/docs/graph-api
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

interface FacebookCredentials {
    accessToken: string;
    pageId: string;
}

export class FacebookNode extends BaseNode {
    readonly name = 'facebook';
    readonly displayName = 'Facebook';
    readonly description = 'Post content and manage Facebook Pages';
    readonly version = 1;
    readonly category: NodeCategory = 'communication';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-facebook',
        color: '#1877F2',
    };

    readonly defaults = { name: 'Facebook', color: '#1877F2' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'facebookApi', required: true, displayName: 'Facebook Graph API' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'postToPage',
            required: true,
            options: [
                { name: 'Get Page Info', value: 'getPageInfo' },
                { name: 'Post to Page', value: 'postToPage' },
                { name: 'Post Photo', value: 'postPhoto' },
                { name: 'Post Video', value: 'postVideo' },
                { name: 'Get Page Posts', value: 'getPagePosts' },
                { name: 'Get Post Insights', value: 'getPostInsights' },
                { name: 'Get Comments', value: 'getComments' },
                { name: 'Reply Comment', value: 'replyComment' },
                { name: 'Delete Post', value: 'deletePost' },
            ],
        },
        {
            name: 'message',
            displayName: 'Message',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'Your post content here...',
            typeOptions: { rows: 4 },
            displayOptions: { show: { operation: ['postToPage', 'postPhoto', 'postVideo'] } },
        },
        {
            name: 'link',
            displayName: 'Link URL',
            type: 'string',
            default: '',
            placeholder: 'https://example.com',
            displayOptions: { show: { operation: ['postToPage'] } },
        },
        {
            name: 'photoUrl',
            displayName: 'Photo URL',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'https://example.com/image.jpg',
            displayOptions: { show: { operation: ['postPhoto'] } },
        },
        {
            name: 'videoUrl',
            displayName: 'Video URL',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'https://example.com/video.mp4',
            displayOptions: { show: { operation: ['postVideo'] } },
        },
        {
            name: 'postId',
            displayName: 'Post ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['getPostInsights', 'getComments', 'deletePost'] } },
        },
        {
            name: 'commentId',
            displayName: 'Comment ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['replyComment'] } },
        },
        {
            name: 'replyText',
            displayName: 'Reply Text',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['replyComment'] } },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.facebookApi as unknown as FacebookCredentials;

        if (!creds?.accessToken || !creds?.pageId) {
            throw new NodeExecutionError('Missing Facebook credentials', this.name, context.nodeId);
        }

        const baseUrl = 'https://graph.facebook.com/v18.0';
        const pageId = creds.pageId;

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'postToPage');
            let response: unknown;

            switch (operation) {
                case 'getPageInfo': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${pageId}?fields=id,name,about,fan_count,followers_count,category&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'postToPage': {
                    const message = this.getParam<string>(context, 'message', index);
                    const link = this.getParam<string>(context, 'link', index, '');
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${pageId}/feed`,
                        body: {
                            message,
                            link: link || undefined,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'postPhoto': {
                    const message = this.getParam<string>(context, 'message', index, '');
                    const photoUrl = this.getParam<string>(context, 'photoUrl', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${pageId}/photos`,
                        body: {
                            url: photoUrl,
                            caption: message,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'postVideo': {
                    const message = this.getParam<string>(context, 'message', index, '');
                    const videoUrl = this.getParam<string>(context, 'videoUrl', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${pageId}/videos`,
                        body: {
                            file_url: videoUrl,
                            description: message,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'getPagePosts': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${pageId}/posts?fields=id,message,created_time,shares,likes.summary(true),comments.summary(true)&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'getPostInsights': {
                    const postId = this.getParam<string>(context, 'postId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${postId}/insights?metric=post_impressions,post_engagements,post_reactions_by_type_total&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'getComments': {
                    const postId = this.getParam<string>(context, 'postId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${postId}/comments?fields=id,message,from,created_time&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'replyComment': {
                    const commentId = this.getParam<string>(context, 'commentId', index);
                    const replyText = this.getParam<string>(context, 'replyText', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${commentId}/comments`,
                        body: {
                            message: replyText,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'deletePost': {
                    const postId = this.getParam<string>(context, 'postId', index);
                    response = await this.httpRequest(context, {
                        method: 'DELETE',
                        url: `${baseUrl}/${postId}?access_token=${creds.accessToken}`,
                    });
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            return { json: { ...item.json, facebook: { operation, response } } };
        });
    }
}

export const facebookNode = new FacebookNode();
