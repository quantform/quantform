# Assets

The Asset represents a security that you can trade or hold in your wallet. For example, you can combine two trading assets to create a trading instrument.



## useBinanceBalance()

This hook is designed to be used to retrieve the balance of a specified asset in
the user's Binance account. The function takes one argument, asset, which is an
object that represents the asset to retrieve the balance for.

If the asset is not supported by Binance, the function returns an observable that
emits assetNotSupported.


## useBinanceBalances()

Retrieves the Binance account balance snapshot for the current user by combining
asset information with user account requests.

```typescript
// pipes an array of non zero balances
const balances = useBinanceBalances().pipe(
  map(it => Object.values(it).filter(it => it.free.gt(d.Zero) || it.locked.gt(d.Zero)))
);
```


## useBinanceBalancesStreaming()

Streams the Binance account balance changes for the current user in real-time
by merging snapshot data with balance socket data.

```typescript
// pipes a collection of changed balances
const changes = useBinanceBalancesStreaming().pipe(
  startWith([]),
  pairwise(),
  map(([prev, curr]) =>
    Object.values(curr).filter(lhs => {
      const rhs = Object.values(prev).find(it => it.asset.id === lhs.asset.id);

      return !rhs || !lhs.free.eq(rhs.free) || lhs.locked.eq(rhs.locked);
    })
  )
);
```

