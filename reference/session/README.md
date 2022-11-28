---
description: >-
  Session is a root object of quantform system. Provides an access to all
  unified trading components.
---

# Session

#### `instruments(): Observable<Instrument[]>`

a method that pipes a collection of tradeable instruments. This method get updated in case of Adapter initialization.

```typescript
// print every tradeable instrument one by one:
session.instruments().pipe(tap((it) => it.forEach(console.log)));
```

#### `instrument(selector: InstrumentSelector): Observable<Instrument>`

\


\
