/**
 * @see https://api.cloudflare.com/#getting-started-requests
 */
export const makeAuthHeaders = ({ authMethod, }) => {
    switch (authMethod.method) {
        case 'API_KEY': {
            return {
                'X-Auth-Key': authMethod.apiKey,
                'X-Auth-Email': authMethod.email,
            };
        }
        case 'API_TOKEN': {
            return {
                'Authorization': `Bearer ${authMethod.apiToken}`,
            };
        }
    }
};
export const makeUrl = ({ apiEndpoint, }) => {
    return {
        account({ accountId }) {
            return new URL(`accounts/${accountId}`, apiEndpoint).href;
        },
        namespace({ accountId, namespaceId }) {
            return new URL(this.account({ accountId }) + `/storage/kv/namespaces/${namespaceId}`, apiEndpoint).href;
        },
        namespaceBulk({ accountId, namespaceId }) {
            return new URL(this.namespace({
                accountId,
                namespaceId,
            }) + `/bulk`, apiEndpoint).href;
        },
    };
};
export const makeRequest = ({ apiEndpoint, authMethod, }) => {
    const url = makeUrl({ apiEndpoint });
    const headers = makeAuthHeaders({ authMethod });
    return {
        bulkWrite({ accountId, namespaceId, data }) {
            return new Request(url.namespaceBulk({ accountId, namespaceId }), {
                method: 'PUT',
                headers: new Headers({
                    ...headers,
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(data),
            });
        },
        bulkDelete({ accountId, namespaceId, keys }) {
            return new Request(url.namespaceBulk({ accountId, namespaceId }), {
                method: 'DELETE',
                headers: new Headers({
                    ...headers,
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(keys),
            });
        },
    };
};
