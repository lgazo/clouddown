# CloudDOWN

A [Level API](https://github.com/Level/abstract-level) implementation on top of [Cloudflare Workers KV](https://www.cloudflare.com/en-gb/products/workers-kv/)

# Usage

## Install

The library has not been published to NPM repository so far. You have to reference GitHub directly.

```bash
pnpm i github:lgazo/clouddown#0.0.1
```

## Use

```typescript
const backend = new CloudDOWN({ namespace: NAMESPACE, batchSupport: false });
```

You can specify multiple options according to `CloudDownOptions` type.

If you specify `batchSupport: false`, the library will not use CloudFlare remote Batch API HTTP endpoint but will simulate the batch operations. It is useful while developing locally.

# Build

`pnpm run build` produces JavaScript with TypeScript types in `lib` directory.

# Publish

The library is available only on GitHub. You need to create a tag once you are satisfied with the functionality.

```bash
git tag -a 0.0.1 
git push --tag
git push
```

# Status

This is an experimental project. The implementation is not feature complete.

Since levelup, and levelgraph (used in tests) depend on some Node APIs, it need to browserify them to use.
