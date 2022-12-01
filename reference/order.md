---
description: Represents an market or limit order on the market.
---

# Order

## Members

|                                <p><strong><code>timestamp</code></strong><br>number</p> | lat update time                                                                    |
| --------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------- |
|                                       <p><strong><code>id</code></strong><br>string</p> | unique local order id                                                              |
|                               <p><strong><code>externalId</code></strong><br>string</p> | order id provided by adapter                                                       |
| <p><strong><code>instrument</code></strong><br><a href="instrument/">Instrument</a></p> | related instrument                                                                 |
|                                <p><strong><code>state</code></strong><br>OrderState</p> | current order state                                                                |
|                                <p><strong><code>quantity</code></strong><br>decimal</p> | quantity of the order, positive value for buy order, negative value for sell order |
|                        <p><strong><code>quantityExecuted</code></strong><br>decimal</p> | executed quantity of the order                                                     |
|                                   <p><strong><code>rate?</code></strong><br>decimal</p> | limit rate for limit order                                                         |
|                   <p><strong><code>averageExecutionRate?</code></strong><br>decimal</p> | order execution rate                                                               |
|  <p><strong><code>createdAt</code></strong><br><strong><code></code></strong>number</p> | creation date                                                                      |
