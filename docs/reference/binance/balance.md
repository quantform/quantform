# Assets

The Asset represents a security that you can trade or hold in your wallet. For example, you can combine two trading assets to create a trading instrument.



## useBinanceBalanceChanges

The code provided defines a function called `useBinanceBalanceChanges`, which
takes an `asset` parameter of type `AssetSelector`. It utilizes the
`useBinanceBalancesChanges` function and applies a series of operations on
its output.

The `useBinanceBalancesChanges` function likely retrieves balance changes
for Binance assets. The output is an object where each asset ID maps to
its corresponding balance change.

The code checks if the `asset` provided exists in the balance changes object.
If it doesn't, it throws a `MissingAssetError` indicating the asset is missing.
If the asset exists, it retrieves the balance change for that asset.

The function then applies the `distinctUntilTimestampChanged` operator to ensure
that only distinct balance changes are emitted based on their timestamp.

Overall, the `useBinanceBalanceChanges` function is designed to provide a stream
of balance changes for a specific Binance asset, ensuring that only distinct
changes are emitted.


## useBinanceBalances()

Retrieves the Binance account balance snapshot for the current user by combining
asset information with user account requests.

```typescript
// pipes an array of non zero balances
const balances = useBinanceBalances().pipe(
  map(it => Object.values(it).filter(it => it.free.gt(d.Zero) || it.locked.gt(d.Zero)))
);
```


## useBinanceBalancesChanges

Streams the Binance account balance changes for the current user in real-time
by merging snapshot data with balance socket data.

```typescript
// pipes a collection of changed balances
const changes = useBinanceBalancesChanges().pipe(
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

