---
description: >-
  a method that pipes a collection of tradeable instruments. This method get
  updated in case of Adapter initialization.
---

# get list of instruments

#### `instruments(): Observable<Instrument[]>`

```typescript
// print every tradeable instrument one by one:
session.instruments().pipe(tap((it) => it.forEach(console.log)));
```

\
