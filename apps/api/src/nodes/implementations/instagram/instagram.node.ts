/**
 * Instagram Graph API Node
 * 
 * ============================================================
 * HOW TO GET INSTAGRAM API CREDENTIALS:
 * ============================================================
 * 
 * 1. Buka https://developers.facebook.com/
 * 2. Buat Facebook App
 * 3. Tambahkan product "Instagram Graph API"
 * 4. Hubungkan Facebook Page dengan Instagram Business Account
 * 5. Generate Access Token dengan permission:
 *    - instagram_basic
 *    - instagram_content_publish
 *    - instagram_manage_comments
 *    - instagram_manage_insights
 * 
 * API Documentation: https://developers.facebook.com/docs/instagram-api
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

interface InstagramCredentials {
    accessToken: string;
    instagramAccountId: string;
}

export class InstagramNode extends BaseNode {
    readonly name = 'instagram';
    readonly displayName = 'Instagram';
    readonly description = 'Post content, manage comments, and get insights from Instagram';
    readonly version = 1;
    readonly category: NodeCategory = 'communication';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-instagram',
        color: '#E4405F',
    };

    readonly defaults = { name: 'Instagram', color: '#E4405F' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'instagramApi', required: true, displayName: 'Instagram Graph API' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'getMedia',
            required: true,
            options: [
                { name: 'Get Account Info', value: 'getAccountInfo' },
                { name: 'Get Media', value: 'getMedia' },
                { name: 'Get Media Insights', value: 'getMediaInsights' },
                { name: 'Post Image', value: 'postImage' },
                { name: 'Post Carousel', value: 'postCarousel' },
                { name: 'Post Reel', value: 'postReel' },
                { name: 'Get Comments', value: 'getComments' },
                { name: 'Reply Comment', value: 'replyComment' },
                { name: 'Delete Comment', value: 'deleteComment' },
                { name: 'Get Account Insights', value: 'getAccountInsights' },
            ],
        },
        // Post Image/Reel
        {
            name: 'mediaUrl',
            displayName: 'Media URL',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'https://example.com/image.jpg',
            description: 'Public URL of the image or video',
            displayOptions: { show: { operation: ['postImage', 'postReel'] } },
        },
        {
            name: 'caption',
            displayName: 'Caption',
            type: 'string',
            default: '',
            placeholder: 'Check out this amazing photo! #instagram',
            typeOptions: { rows: 4 },
            displayOptions: { show: { operation: ['postImage', 'postCarousel', 'postReel'] } },
        },
        // Carousel
        {
            name: 'carouselUrls',
            displayName: 'Carousel Media URLs (JSON)',
            type: 'json',
            default: '["https://example.com/img1.jpg", "https://example.com/img2.jpg"]',
            description: 'Array of image URLs (2-10 images)',
            displayOptions: { show: { operation: ['postCarousel'] } },
        },
        // Media ID for operations
        {
            name: 'mediaId',
            displayName: 'Media ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['getMediaInsights', 'getComments'] } },
        },
        // Comment operations
        {
            name: 'commentId',
            displayName: 'Comment ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['replyComment', 'deleteComment'] } },
        },
        {
            name: 'replyText',
            displayName: 'Reply Text',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['replyComment'] } },
        },
        // Insights
        {
            name: 'insightsMetric',
            displayName: 'Metrics',
            type: 'options',
            default: 'impressions,reach,engagement',
            options: [
                { name: 'Impressions, Reach, Engagement', value: 'impressions,reach,engagement' },
                { name: 'Profile Views, Follows', value: 'profile_views,follower_count' },
                { name: 'All Basic', value: 'impressions,reach,profile_views,follower_count' },
            ],
            displayOptions: { show: { operation: ['getAccountInsights'] } },
        },
        {
            name: 'insightsPeriod',
            displayName: 'Period',
            type: 'options',
            default: 'day',
            options: [
                { name: 'Day', value: 'day' },
                { name: 'Week', value: 'week' },
                { name: 'Month', value: 'days_28' },
            ],
            displayOptions: { show: { operation: ['getAccountInsights'] } },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.instagramApi as unknown as InstagramCredentials;

        if (!creds?.accessToken || !creds?.instagramAccountId) {
            throw new NodeExecutionError('Missing Instagram credentials', this.name, context.nodeId);
        }

        const baseUrl = 'https://graph.facebook.com/v18.0';
        const igId = creds.instagramAccountId;

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'getMedia');
            let response: unknown;

            switch (operation) {
                case 'getAccountInfo': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${igId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'getMedia': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${igId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'postImage': {
                    const mediaUrl = this.getParam<string>(context, 'mediaUrl', index);
                    const caption = this.getParam<string>(context, 'caption', index, '');

                    // Step 1: Create container
                    const container = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${igId}/media`,
                        body: {
                            image_url: mediaUrl,
                            caption,
                            access_token: creds.accessToken,
                        },
                    }) as { id: string };

                    // Step 2: Publish
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${igId}/media_publish`,
                        body: {
                            creation_id: container.id,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'postReel': {
                    const mediaUrl = this.getParam<string>(context, 'mediaUrl', index);
                    const caption = this.getParam<string>(context, 'caption', index, '');

                    const container = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${igId}/media`,
                        body: {
                            media_type: 'REELS',
                            video_url: mediaUrl,
                            caption,
                            access_token: creds.accessToken,
                        },
                    }) as { id: string };

                    // Wait for processing
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${igId}/media_publish`,
                        body: {
                            creation_id: container.id,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'postCarousel': {
                    const urlsJson = this.getParam<string>(context, 'carouselUrls', index, '[]');
                    const caption = this.getParam<string>(context, 'caption', index, '');
                    const urls = JSON.parse(urlsJson) as string[];

                    // Create containers for each image
                    const containerIds: string[] = [];
                    for (const url of urls) {
                        const c = await this.httpRequest(context, {
                            method: 'POST',
                            url: `${baseUrl}/${igId}/media`,
                            body: {
                                image_url: url,
                                is_carousel_item: true,
                                access_token: creds.accessToken,
                            },
                        }) as { id: string };
                        containerIds.push(c.id);
                    }

                    // Create carousel container
                    const carousel = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${igId}/media`,
                        body: {
                            media_type: 'CAROUSEL',
                            children: containerIds.join(','),
                            caption,
                            access_token: creds.accessToken,
                        },
                    }) as { id: string };

                    // Publish
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${igId}/media_publish`,
                        body: {
                            creation_id: carousel.id,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'getComments': {
                    const mediaId = this.getParam<string>(context, 'mediaId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${mediaId}/comments?fields=id,text,username,timestamp&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'replyComment': {
                    const commentId = this.getParam<string>(context, 'commentId', index);
                    const replyText = this.getParam<string>(context, 'replyText', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/${commentId}/replies`,
                        body: {
                            message: replyText,
                            access_token: creds.accessToken,
                        },
                    });
                    break;
                }

                case 'deleteComment': {
                    const commentId = this.getParam<string>(context, 'commentId', index);
                    response = await this.httpRequest(context, {
                        method: 'DELETE',
                        url: `${baseUrl}/${commentId}?access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'getMediaInsights': {
                    const mediaId = this.getParam<string>(context, 'mediaId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${mediaId}/insights?metric=engagement,impressions,reach,saved&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                case 'getAccountInsights': {
                    const metrics = this.getParam<string>(context, 'insightsMetric', index);
                    const period = this.getParam<string>(context, 'insightsPeriod', index, 'day');
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/${igId}/insights?metric=${metrics}&period=${period}&access_token=${creds.accessToken}`,
                    });
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            return { json: { ...item.json, instagram: { operation, response } } };
        });
    }
}

export const instagramNode = new InstagramNode();
