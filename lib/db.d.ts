/// <reference types="@cloudflare/workers-types" />
/// <reference types="@types/node" />
import type { AbstractOpenOptions, AbstractGetOptions, NodeCallback, AbstractBatchOptions, AbstractBatchOperation, AbstractDelOptions, AbstractPutOptions } from 'abstract-level';
import { AbstractLevel } from 'abstract-level';
import type { K, V } from './common';
import type { CloudIteratorOptions } from './iterator';
import { CloudIterator } from './iterator';
import * as API from './cloudflare';
declare type CloudDownOptions = {
    namespace: KVNamespace;
    /**
     * @default "https://api.cloudflare.com/client/v4"
     */
    apiEndpoint?: string;
    /**
     * Fetch implementation
     *
     * @default globalThis.fetch
     */
    fetch?: typeof globalThis['fetch'];
    /**
     * requires to use batch operation
     *
     * @see https://developers.cloudflare.com/workers/runtime-apis/kv#writing-data-in-bulk
     */
    accountId?: string;
    /**
     * requires to use batch operation
     *
     * @see https://developers.cloudflare.com/workers/runtime-apis/kv#writing-data-in-bulk
     */
    namespaceId?: string;
    /**
     * requires to use batch operation
     *
     * @see https://api.cloudflare.com/#getting-started-requests
     */
    authMethod?: API.AuthMethod;
    /**
     * @see https://developers.cloudflare.com/workers/runtime-apis/kv#cache-ttl
     */
    defaultCacheTtl?: number;
    /**
     * If batch support is disabled we iterate through batch operations and call individual methods instead of batch endpoint.
     */
    batchSupport?: boolean;
};
export declare class CloudDOWN extends AbstractLevel<K, V> {
    #private;
    constructor(options: CloudDownOptions);
    _kv_list(): Promise<KVNamespaceListKey<unknown>[]>;
    _open(_options: AbstractOpenOptions, callback: NodeCallback<void>): Promise<void>;
    _close(callback: NodeCallback<void>): Promise<void>;
    kv_encoding(): {
        encode: (key: K | V | null) => string;
        decode: (key: K | V | null) => Buffer;
    };
    kv_keyEncoding(): {
        encode: (key: V | null) => string;
        decode: (key: V | null) => Buffer;
    };
    kv_valueEncoding(): {
        encode: (key: V | null) => string;
        decode: (key: V | null) => Buffer;
    };
    _put(key: K, value: V, options: AbstractPutOptions<K, V> & {
        /**
         * To associate some metadata with a key-value pair set metadata to any arbitrary object (must serialize to JSON) in the put options object on a put call.
         */
        metadata?: Record<string, unknown>;
    }, callback: NodeCallback<void>): Promise<void>;
    _get(key: K, options: AbstractGetOptions<K, V> & {
        cacheTtl?: number;
    }, callback: NodeCallback<V | void>): Promise<void>;
    _del(key: K, _options: AbstractDelOptions<K>, callback: NodeCallback<void>): Promise<void>;
    _batch_via_endpoint(ops: Array<AbstractBatchOperation<CloudDOWN, K, V>>, _options: AbstractBatchOptions<K, V>, callback: NodeCallback<void>): Promise<void>;
    _batch_simulated(ops: Array<AbstractBatchOperation<CloudDOWN, K, V>>, _options: AbstractBatchOptions<K, V>, callback: NodeCallback<void>): Promise<void>;
    _batch(ops: Array<AbstractBatchOperation<CloudDOWN, K, V>>, _options: AbstractBatchOptions<K, V>, callback: NodeCallback<void>): Promise<void>;
    _iterator(options: CloudIteratorOptions): CloudIterator;
}
export {};
