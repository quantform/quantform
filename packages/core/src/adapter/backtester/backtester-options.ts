import { Feed } from '../../feed';
import { timestamp } from '../../common';
import { PaperOptions } from '../paper/paper-options';

export class BacktesterOptions extends PaperOptions {
  from: timestamp;
  to: timestamp;
  feed: Feed;
  completed: () => void;
}
