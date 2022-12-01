---
description: Exposes an access to binance.com spot market.
---

# Binance Futures



## Setting up

There are to ways to configure adapter:

* define environment variables in your system or in local .env file

```bash
// provide following environment variables:
QF_BINANCEFUTURE_APIKEY=your_api_key
QF_BINANCEFUTURE_APISECRET=your_api_secret
```

* provide sensitive data in adapter constructor (not recommended, due security violation)

```typescript
const adapter = binanceFuture({
  key: "your_api_key",
  secret: "your_api_secret",
});
```

{% hint style="danger" %}
Remember to keep api credentials secure, never store them in a code or provide to third-parties.
{% endhint %}

## Usage

```typescript
// create a new instance with parameter less constructor.
const adapter = binanceFuture();
```
