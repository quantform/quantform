import { Feed } from '../feed';
import { timestamp } from '../common';
import { ExchangePaperTradingOptions } from '../exchange-paper-trading/exchange-paper-trading.options';

export class ExchangeBacktesterOptions extends ExchangePaperTradingOptions {
  from: timestamp;
  to: timestamp;
  feed: Feed;
}
