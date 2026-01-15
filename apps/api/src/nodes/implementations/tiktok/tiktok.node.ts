/**
 * TikTok for Business API Node
 * 
 * ============================================================
 * HOW TO GET TIKTOK API CREDENTIALS:
 * ============================================================
 * 
 * 1. Daftar di https://developers.tiktok.com/
 * 2. Buat aplikasi baru
 * 3. Pilih "Login Kit" dan "Content Posting API"
 * 4. Dapatkan App ID dan App Secret
 * 5. OAuth untuk mendapatkan Access Token
 * 
 * API Documentation: https://developers.tiktok.com/doc/
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

interface TikTokCredentials {
    accessToken: string;
    openId: string;
}

export class TikTokNode extends BaseNode {
    readonly name = 'tiktok';
    readonly displayName = 'TikTok';
    readonly description = 'Post videos and get analytics from TikTok';
    readonly version = 1;
    readonly category: NodeCategory = 'communication';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-music',
        color: '#000000',
    };

    readonly defaults = { name: 'TikTok', color: '#000000' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'tiktokApi', required: true, displayName: 'TikTok API' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'getUserInfo',
            required: true,
            options: [
                { name: 'Get User Info', value: 'getUserInfo' },
                { name: 'Get Videos', value: 'getVideos' },
                { name: 'Upload Video', value: 'uploadVideo' },
                { name: 'Get Video Comments', value: 'getComments' },
                { name: 'Reply Comment', value: 'replyComment' },
                { name: 'Get Video Analytics', value: 'getVideoAnalytics' },
            ],
        },
        {
            name: 'videoUrl',
            displayName: 'Video URL',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'https://example.com/video.mp4',
            description: 'Public URL of the video file',
            displayOptions: { show: { operation: ['uploadVideo'] } },
        },
        {
            name: 'videoTitle',
            displayName: 'Title / Caption',
            type: 'string',
            default: '',
            placeholder: 'Check this out! #tiktok #viral',
            typeOptions: { rows: 3 },
            displayOptions: { show: { operation: ['uploadVideo'] } },
        },
        {
            name: 'privacyLevel',
            displayName: 'Privacy Level',
            type: 'options',
            default: 'PUBLIC_TO_EVERYONE',
            options: [
                { name: 'Public', value: 'PUBLIC_TO_EVERYONE' },
                { name: 'Friends Only', value: 'MUTUAL_FOLLOW_FRIENDS' },
                { name: 'Private', value: 'SELF_ONLY' },
            ],
            displayOptions: { show: { operation: ['uploadVideo'] } },
        },
        {
            name: 'disableDuet',
            displayName: 'Disable Duet',
            type: 'boolean',
            default: false,
            displayOptions: { show: { operation: ['uploadVideo'] } },
        },
        {
            name: 'disableStitch',
            displayName: 'Disable Stitch',
            type: 'boolean',
            default: false,
            displayOptions: { show: { operation: ['uploadVideo'] } },
        },
        {
            name: 'disableComment',
            displayName: 'Disable Comments',
            type: 'boolean',
            default: false,
            displayOptions: { show: { operation: ['uploadVideo'] } },
        },
        {
            name: 'videoId',
            displayName: 'Video ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['getComments', 'getVideoAnalytics'] } },
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
        const creds = credentials?.tiktokApi as unknown as TikTokCredentials;

        if (!creds?.accessToken) {
            throw new NodeExecutionError('Missing TikTok credentials', this.name, context.nodeId);
        }

        const baseUrl = 'https://open.tiktokapis.com/v2';
        const headers = {
            'Authorization': `Bearer ${creds.accessToken}`,
            'Content-Type': 'application/json',
        };

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'getUserInfo');
            let response: unknown;

            switch (operation) {
                case 'getUserInfo': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/user/info/?fields=open_id,union_id,avatar_url,avatar_url_100,avatar_large_url,display_name,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count`,
                        headers,
                    });
                    break;
                }

                case 'getVideos': {
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/video/list/?fields=id,title,video_description,duration,cover_image_url,share_url,view_count,like_count,comment_count,share_count,create_time`,
                        headers,
                        body: { max_count: 20 },
                    });
                    break;
                }

                case 'uploadVideo': {
                    const videoUrl = this.getParam<string>(context, 'videoUrl', index);
                    const title = this.getParam<string>(context, 'videoTitle', index, '');
                    const privacy = this.getParam<string>(context, 'privacyLevel', index, 'PUBLIC_TO_EVERYONE');
                    const disableDuet = this.getParam<boolean>(context, 'disableDuet', index, false);
                    const disableStitch = this.getParam<boolean>(context, 'disableStitch', index, false);
                    const disableComment = this.getParam<boolean>(context, 'disableComment', index, false);

                    // Initialize upload
                    const initResponse = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/post/publish/video/init/`,
                        headers,
                        body: {
                            post_info: {
                                title,
                                privacy_level: privacy,
                                disable_duet: disableDuet,
                                disable_stitch: disableStitch,
                                disable_comment: disableComment,
                            },
                            source_info: {
                                source: 'PULL_FROM_URL',
                                video_url: videoUrl,
                            },
                        },
                    });

                    response = initResponse;
                    break;
                }

                case 'getComments': {
                    const videoId = this.getParam<string>(context, 'videoId', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/video/comment/list/?fields=id,text,create_time,likes_count`,
                        headers,
                        body: {
                            video_id: videoId,
                            max_count: 50,
                        },
                    });
                    break;
                }

                case 'replyComment': {
                    const videoId = this.getParam<string>(context, 'videoId', index);
                    const commentId = this.getParam<string>(context, 'commentId', index);
                    const replyText = this.getParam<string>(context, 'replyText', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/video/comment/reply/`,
                        headers,
                        body: {
                            video_id: videoId,
                            comment_id: commentId,
                            text: replyText,
                        },
                    });
                    break;
                }

                case 'getVideoAnalytics': {
                    const videoId = this.getParam<string>(context, 'videoId', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/video/query/?fields=id,title,view_count,like_count,comment_count,share_count`,
                        headers,
                        body: { filters: { video_ids: [videoId] } },
                    });
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            return { json: { ...item.json, tiktok: { operation, response } } };
        });
    }
}

export const tiktokNode = new TikTokNode();
