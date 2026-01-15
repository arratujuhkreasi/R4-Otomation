/**
 * Twitter API v2 Node
 * 
 * ============================================================
 * HOW TO GET TWITTER API CREDENTIALS:
 * ============================================================
 * 
 * 1. Buka https://developer.twitter.com/
 * 2. Buat project dan app baru
 * 3. Generate API Key, API Secret, Bearer Token
 * 4. Generate Access Token dan Access Token Secret
 * 
 * API Documentation: https://developer.twitter.com/en/docs/twitter-api
 * ============================================================
 */

import crypto from 'crypto';
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

interface TwitterCredentials {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    bearerToken: string;
}

export class TwitterNode extends BaseNode {
    readonly name = 'twitter';
    readonly displayName = 'Twitter / X';
    readonly description = 'Post tweets, get mentions, and interact on Twitter/X';
    readonly version = 1;
    readonly category: NodeCategory = 'communication';

    readonly icon = {
        type: 'fa' as const,
        value: 'fa-twitter',
        color: '#1DA1F2',
    };

    readonly defaults = { name: 'Twitter', color: '#1DA1F2' };

    readonly credentials: NodeCredentialRequirement[] = [
        { name: 'twitterApi', required: true, displayName: 'Twitter API v2' },
    ];

    readonly properties: NodeProperty[] = [
        {
            name: 'operation',
            displayName: 'Operation',
            type: 'options',
            default: 'postTweet',
            required: true,
            options: [
                { name: 'Post Tweet', value: 'postTweet' },
                { name: 'Post Tweet with Media', value: 'postTweetMedia' },
                { name: 'Reply to Tweet', value: 'replyTweet' },
                { name: 'Retweet', value: 'retweet' },
                { name: 'Like Tweet', value: 'likeTweet' },
                { name: 'Get Tweet', value: 'getTweet' },
                { name: 'Get Me', value: 'getMe' },
                { name: 'Get Mentions', value: 'getMentions' },
                { name: 'Delete Tweet', value: 'deleteTweet' },
                { name: 'Search Tweets', value: 'searchTweets' },
            ],
        },
        {
            name: 'tweetText',
            displayName: 'Tweet Text',
            type: 'string',
            default: '',
            required: true,
            placeholder: 'Your tweet here (max 280 chars)',
            typeOptions: { rows: 3 },
            displayOptions: { show: { operation: ['postTweet', 'postTweetMedia', 'replyTweet'] } },
        },
        {
            name: 'tweetId',
            displayName: 'Tweet ID',
            type: 'string',
            default: '',
            required: true,
            displayOptions: { show: { operation: ['replyTweet', 'retweet', 'likeTweet', 'getTweet', 'deleteTweet'] } },
        },
        {
            name: 'mediaUrl',
            displayName: 'Media URL',
            type: 'string',
            default: '',
            placeholder: 'https://example.com/image.jpg',
            displayOptions: { show: { operation: ['postTweetMedia'] } },
        },
        {
            name: 'searchQuery',
            displayName: 'Search Query',
            type: 'string',
            default: '',
            required: true,
            placeholder: '#nodejs OR @twitter',
            displayOptions: { show: { operation: ['searchTweets'] } },
        },
        {
            name: 'maxResults',
            displayName: 'Max Results',
            type: 'number',
            default: 10,
            displayOptions: { show: { operation: ['searchTweets', 'getMentions'] } },
        },
    ];

    protected async run(
        context: NodeExecutionContext,
        inputData: NodeInputData,
        credentials?: NodeCredentials
    ): Promise<NodeOutputData> {
        const creds = credentials?.twitterApi as unknown as TwitterCredentials;

        if (!creds?.bearerToken) {
            throw new NodeExecutionError('Missing Twitter credentials', this.name, context.nodeId);
        }

        const baseUrl = 'https://api.twitter.com/2';
        const headers = {
            'Authorization': `Bearer ${creds.bearerToken}`,
            'Content-Type': 'application/json',
        };

        return this.processItems(context, inputData, async (item, index) => {
            const operation = this.getParam<string>(context, 'operation', index, 'postTweet');
            let response: unknown;

            switch (operation) {
                case 'getMe': {
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/users/me?user.fields=id,name,username,description,profile_image_url,public_metrics`,
                        headers,
                    });
                    break;
                }

                case 'postTweet': {
                    const text = this.getParam<string>(context, 'tweetText', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/tweets`,
                        headers: this.getOAuthHeaders('POST', `${baseUrl}/tweets`, creds),
                        body: { text },
                    });
                    break;
                }

                case 'replyTweet': {
                    const text = this.getParam<string>(context, 'tweetText', index);
                    const tweetId = this.getParam<string>(context, 'tweetId', index);
                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/tweets`,
                        headers: this.getOAuthHeaders('POST', `${baseUrl}/tweets`, creds),
                        body: {
                            text,
                            reply: { in_reply_to_tweet_id: tweetId },
                        },
                    });
                    break;
                }

                case 'getTweet': {
                    const tweetId = this.getParam<string>(context, 'tweetId', index);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/tweets/${tweetId}?tweet.fields=created_at,public_metrics,author_id,text`,
                        headers,
                    });
                    break;
                }

                case 'deleteTweet': {
                    const tweetId = this.getParam<string>(context, 'tweetId', index);
                    response = await this.httpRequest(context, {
                        method: 'DELETE',
                        url: `${baseUrl}/tweets/${tweetId}`,
                        headers: this.getOAuthHeaders('DELETE', `${baseUrl}/tweets/${tweetId}`, creds),
                    });
                    break;
                }

                case 'retweet': {
                    const tweetId = this.getParam<string>(context, 'tweetId', index);
                    // First get user ID
                    const me = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/users/me`,
                        headers,
                    }) as { data: { id: string } };

                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/users/${me.data.id}/retweets`,
                        headers: this.getOAuthHeaders('POST', `${baseUrl}/users/${me.data.id}/retweets`, creds),
                        body: { tweet_id: tweetId },
                    });
                    break;
                }

                case 'likeTweet': {
                    const tweetId = this.getParam<string>(context, 'tweetId', index);
                    const me = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/users/me`,
                        headers,
                    }) as { data: { id: string } };

                    response = await this.httpRequest(context, {
                        method: 'POST',
                        url: `${baseUrl}/users/${me.data.id}/likes`,
                        headers: this.getOAuthHeaders('POST', `${baseUrl}/users/${me.data.id}/likes`, creds),
                        body: { tweet_id: tweetId },
                    });
                    break;
                }

                case 'getMentions': {
                    const maxResults = this.getParam<number>(context, 'maxResults', index, 10);
                    const me = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/users/me`,
                        headers,
                    }) as { data: { id: string } };

                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/users/${me.data.id}/mentions?max_results=${maxResults}&tweet.fields=created_at,author_id,text,public_metrics`,
                        headers,
                    });
                    break;
                }

                case 'searchTweets': {
                    const query = this.getParam<string>(context, 'searchQuery', index);
                    const maxResults = this.getParam<number>(context, 'maxResults', index, 10);
                    response = await this.httpRequest(context, {
                        method: 'GET',
                        url: `${baseUrl}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=created_at,author_id,text,public_metrics`,
                        headers,
                    });
                    break;
                }

                default:
                    throw new NodeExecutionError(`Unknown operation: ${operation}`, this.name, context.nodeId);
            }

            return { json: { ...item.json, twitter: { operation, response } } };
        });
    }

    private getOAuthHeaders(method: string, url: string, creds: TwitterCredentials): Record<string, string> {
        const oauth: Record<string, string> = {
            oauth_consumer_key: creds.apiKey,
            oauth_nonce: crypto.randomBytes(16).toString('hex'),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_token: creds.accessToken,
            oauth_version: '1.0',
        };

        const signatureBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
            Object.keys(oauth).sort().map(k => `${k}=${oauth[k]}`).join('&')
        )}`;
        const signingKey = `${encodeURIComponent(creds.apiSecret)}&${encodeURIComponent(creds.accessTokenSecret)}`;
        oauth.oauth_signature = crypto.createHmac('sha1', signingKey).update(signatureBase).digest('base64');

        const authHeader = 'OAuth ' + Object.keys(oauth).sort().map(k =>
            `${encodeURIComponent(k)}="${encodeURIComponent(oauth[k])}"`
        ).join(', ');

        return {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
        };
    }
}

export const twitterNode = new TwitterNode();
