/// <reference types="@cloudflare/workers-types" />
import { AbstractIterator } from 'abstract-level';
;
const B64 = '{b64}';
const decode = (key) => Buffer.from(key.substring(B64.length), 'base64');
export class CloudIterator extends AbstractIterator {
    keys;
    position;
    nextTick;
    constructor(db, options) {
        super(db, options);
        // this[kInit](db[kTree], options)
        this.position = -1;
        this.nextTick = db.nextTick;
    }
    async _ensure() {
        if (this.keys) {
            return;
        }
        const keys = await this.db._kv_list();
        this.keys = keys;
        if (keys && keys.length > 0) {
            this.position = 0;
        }
    }
    async _next(callback) {
        await this._ensure();
        //   if (!this[kIterator].valid) return this.nextTick(callback)
        //   const key = this[kIterator].key
        //   const value = this[kIterator].value
        //   if (!this[kTest](key)) return this.nextTick(callback)
        //   this[kIterator][this[kAdvance]]()
        //   this.nextTick(callback, null, key, value)
        // _nextv (size, options, callback) {
        //   const it = this[kIterator]
        //   const entries = []
        //   while (it.valid && entries.length < size && this[kTest](it.key)) {
        //     entries.push([it.key, it.value])
        //     it[this[kAdvance]]()
        //   }
        console.debug(`next @ ${this.position}`);
        if (!this.keys || this.position === -1 || this.position >= this.keys.length) {
            console.debug('[clouddown iterator] nothing next');
            callback(null);
            // this.nextTick(callback, null, null, null);
            return;
        }
        const kv_key = this.keys[this.position];
        const cb = (err, value) => new Promise((resolve, reject) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(value);
            }
        });
        const value = await this.db._get(kv_key.name, {}, cb);
        this.position = this.position + 1;
        this.nextTick(callback, null, decode(kv_key.name), value);
    }
    _all(options, callback) {
        //   const size = this.limit - this.count
        //   const it = this[kIterator]
        //   const entries = []
        //   while (it.valid && entries.length < size && this[kTest](it.key)) {
        //     entries.push([it.key, it.value])
        //     it[this[kAdvance]]()
        //   }
        //   this.nextTick(callback, null, entries)
        throw new Error(`Iterator all with options ${options}`);
    }
    _seek(target) {
        throw new Error(`Iterator seek with target ${target}`);
    }
    _end() {
        throw new Error("Iterator end");
    }
}
