/// <reference types="@cloudflare/workers-types" />
import { AbstractLevel } from 'abstract-level';
import { supports } from 'level-supports';
import { CloudDownError } from './common';
import { CloudIterator } from './iterator';
import * as API from './cloudflare';
const B64 = '{b64}';
export class CloudDOWN extends AbstractLevel {
    #options;
    #namespace;
    #apiEndpoint;
    #fetch;
    #accountId;
    #namespaceId;
    #authMethod;
    #defaultCacheTtl;
    constructor(options) {
        super(supports({
            // permanence: true,
            // seek: false,
            // promises: true,
            encodings: {
                buffer: true,
                view: false,
                utf8: false
            }
        }));
        this.#options = options;
        this.#namespace = options.namespace;
        this.#apiEndpoint = options.apiEndpoint || 'https://cloudflare.com/client/v4';
        this.#fetch = options.fetch || globalThis.fetch;
        this.#accountId = options.accountId;
        this.#namespaceId = options.namespaceId;
        this.#authMethod = options.authMethod;
        this.#defaultCacheTtl = options.defaultCacheTtl ?? 60;
        console.debug(`[clouddown db] constructed`, { options });
    }
    async _kv_list() {
        const value = await this.#namespace.list();
        console.debug(`[clouddown _kv_list]`, { value, keys: value.keys });
        return value.keys;
    }
    async _open(_options, callback) {
        console.debug(`[clouddown db] open`);
        return void callback(undefined);
    }
    async _close(callback) {
        console.debug(`[clouddown db] close`);
        return void callback(undefined);
    }
    kv_encoding() {
        return {
            encode: (key) => {
                if (Buffer.isBuffer(key)) {
                    return `${B64}${key.toString('base64')}`;
                }
                else if (typeof key === 'string') {
                    if (key.startsWith(B64)) {
                        return key;
                    }
                    else {
                        const b = Buffer.from(key, 'utf8');
                        return `${B64}${b.toString('base64')}`;
                    }
                }
                else {
                    throw new Error(`Unhandled type of key ${key}`);
                }
            },
            decode: (key) => {
                if (Buffer.isBuffer(key)) {
                    console.debug(`[kv_encoding] decode isBuffer`, { key });
                    return key;
                }
                else if (typeof key === 'string') {
                    console.debug(`[kv_encoding] decode is string`, { key });
                    if (key.startsWith(B64)) {
                        return Buffer.from(key.substring(B64.length), 'base64');
                    }
                    else {
                        console.debug(`[kv_encoding] who knows of string`, { key });
                        throw new Error(`Unhandled type of key of string ${key}`);
                    }
                }
                else {
                    console.debug(`[kv_encoding] who knows`, { key });
                    throw new Error(`Unhandled type of key ${key}`);
                }
            }
        };
    }
    ;
    kv_keyEncoding() {
        return this.kv_encoding();
    }
    kv_valueEncoding() {
        return this.kv_encoding();
    }
    ;
    async _put(key, value, options, callback) {
        console.debug(`[clouddown db] put start`, { key, value, options, key_type: typeof key, value_type: typeof value });
        const { metadata } = options;
        try {
            // const decoded_key = options.keyEncoding === 'buffer' || typeof key !== 'string' ? key.toString() : key;
            const encoded_key = this.kv_keyEncoding().encode(key);
            const encoded_value = this.kv_valueEncoding().encode(value);
            await this.#namespace.put(encoded_key, encoded_value, { metadata });
            console.debug(`[clouddown db] put`, { key, value, encoded_key, encoded_value });
            return void callback(undefined);
        }
        catch (error) {
            return void callback(error);
        }
        // this.nextTick(callback)
    }
    async _get(key, options, callback) {
        console.debug(`[clouddown db] get start`, { key });
        const { cacheTtl = this.#defaultCacheTtl, } = options;
        let value = null;
        let decoded_value = null;
        try {
            // if (options.valueEncoding === 'buffer') {
            const encoded_key = this.kv_keyEncoding().encode(key);
            // value = await this.#namespace.get(encoded_key, { type: 'arrayBuffer', cacheTtl });
            // } else {
            value = await this.#namespace.get(key, { type: 'text', cacheTtl });
            // }
            console.debug('[clouddown db] get before decode');
            decoded_value = this.kv_valueEncoding().decode(value);
            console.debug('[clouddown db] get after decode');
            console.debug(`[clouddown db] get (${options.valueEncoding})`, { key, encoded_key, value, decoded_value });
        }
        catch (error) {
            console.error(`[clouddown get] ERROR !!!!`, { error });
            return callback(error);
        }
        if (decoded_value === null) {
            console.error(`[clouddown get] ERROR not found !!!!`);
            return callback(new CloudDownError('NotFound'));
        }
        else {
            return callback(undefined, decoded_value);
        }
        // this.nextTick(callback, null, value)
    }
    async _del(key, _options, callback) {
        console.debug(`[clouddown del]`, { _options });
        try {
            await this.#namespace.delete(key);
            return void callback(undefined);
        }
        catch (error) {
            return void callback(error);
        }
    }
    async _batch_via_endpoint(ops, _options, callback) {
        if (!this.#accountId) {
            return void callback(new CloudDownError('accountId must be specified to use batch operation'));
        }
        if (!this.#namespaceId) {
            return void callback(new CloudDownError('namespaceId must be specified to use batch operation'));
        }
        if (!this.#authMethod) {
            return void callback(new CloudDownError('authMethod is required to use batch operation'));
        }
        const puts = [];
        const dels = [];
        for (const op of ops) {
            switch (op.type) {
                case 'put': {
                    puts.push({ key: op.key, value: op.value });
                    break;
                }
                case 'del': {
                    dels.push(op.key);
                    break;
                }
            }
        }
        try {
            const request = API.makeRequest({
                apiEndpoint: this.#apiEndpoint,
                authMethod: this.#authMethod,
            });
            await Promise.all([
                this.#fetch(request.bulkWrite({
                    accountId: this.#accountId,
                    namespaceId: this.#namespaceId,
                    data: puts,
                })),
                this.#fetch(request.bulkDelete({
                    accountId: this.#accountId,
                    namespaceId: this.#namespaceId,
                    keys: dels,
                })),
            ]);
        }
        catch (error) {
            return void callback(error);
        }
    }
    async _batch_simulated(ops, _options, callback) {
        await Promise.all(ops.map((op) => {
            const cb = (err, value) => new Promise((resolve, reject) => {
                console.debug(`[batch_simulated] cb ${op.type}`, { err, value });
                if (err) {
                    reject(err);
                }
                else {
                    resolve(value);
                }
            });
            switch (op.type) {
                case 'put': {
                    return this._put(op.key, op.value, _options, cb);
                }
                case 'del': {
                    return this._del(op.key, _options, cb);
                }
            }
        }));
        // return void callback(undefined);
        this.nextTick(callback);
        // const puts: Array<{ key: K, value: V }> = [];
        // const dels: Array<string> = [];
        // for (const op of ops) {
        //   switch (op.type) {
        //     case 'put': {
        //       await this._put(op.key, op.value, {}, );
        //       break;
        //     }
        //     case 'del': {
        //       dels.push(op.key);
        //       break;
        //     }
        //   }
        // }
    }
    async _batch(ops, _options, callback) {
        if (this.#options.batchSupport === undefined || this.#options.batchSupport === true) {
            return this._batch_via_endpoint(ops, _options, callback);
        }
        else {
            return this._batch_simulated(ops, _options, callback);
        }
    }
    _iterator(options) {
        // throw new CloudDownError('TODO');
        return new CloudIterator(this, options);
    }
}
