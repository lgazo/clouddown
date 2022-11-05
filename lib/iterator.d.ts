/// <reference types="@cloudflare/workers-types" />
import type { AbstractIteratorOptions, NodeCallback } from 'abstract-level';
import { AbstractIterator } from 'abstract-level';
import type { K, V } from './common';
import type { CloudDOWN } from './db';
export interface CloudIteratorOptions extends AbstractIteratorOptions<K, V> {
}
export declare class CloudIterator extends AbstractIterator<CloudDOWN, K, V> {
    keys?: KVNamespaceListKey<any>[];
    position: number;
    nextTick: (fn: Function, ...args: any[]) => void;
    constructor(db: CloudDOWN, options: CloudIteratorOptions);
    _ensure(): Promise<void>;
    _next(callback: NodeCallback<K>): Promise<void>;
    _all(options: unknown, callback: NodeCallback<[K]>): void;
    _seek(target: K): void;
    _end(): void;
}
