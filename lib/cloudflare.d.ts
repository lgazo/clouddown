import type { V } from './common';
export declare type AuthMethod = ({
    method: 'API_TOKEN';
    apiToken: string;
} | {
    method: 'API_KEY';
    apiKey: string;
    email: string;
});
interface MakeAuthHeaders {
    (props: {
        authMethod: AuthMethod;
    }): Record<string, string>;
}
/**
 * @see https://api.cloudflare.com/#getting-started-requests
 */
export declare const makeAuthHeaders: MakeAuthHeaders;
interface MakeUrl {
    (props: {
        apiEndpoint: string;
    }): {
        /**
         * @see https://api.cloudflare.com/#accounts-account-details
         */
        account(props: {
            accountId: string;
        }): string;
        namespace(props: {
            accountId: string;
            namespaceId: string;
        }): string;
        /**
         * @see https://api.cloudflare.com/#workers-kv-namespace-write-multiple-key-value-pairs
         * @see https://api.cloudflare.com/#workers-kv-namespace-delete-multiple-key-value-pairs
         */
        namespaceBulk(props: {
            accountId: string;
            namespaceId: string;
        }): string;
    };
}
export declare const makeUrl: MakeUrl;
interface MakeRequest {
    (props: {
        apiEndpoint: string;
        authMethod: AuthMethod;
    }): {
        /**
         * @see https://api.cloudflare.com/#workers-kv-namespace-write-multiple-key-value-pairs
        */
        bulkWrite(props: {
            accountId: string;
            namespaceId: string;
            data: Array<{
                key: string;
                value: V;
            }>;
        }): Request;
        /**
         * @see https://api.cloudflare.com/#workers-kv-namespace-delete-multiple-key-value-pairs
        */
        bulkDelete(props: {
            accountId: string;
            namespaceId: string;
            keys: string[];
        }): Request;
    };
}
export declare const makeRequest: MakeRequest;
export {};
