import { timestamp } from '../../common';
import { PaperOptions } from '../paper/paper-options';

export class BacktesterOptions extends PaperOptions {
  from: timestamp;
  to: timestamp;
  completed: () => void;
}
