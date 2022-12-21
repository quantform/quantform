import { timestamp } from '@lib/shared';

export interface Component {
  /**
   * Component type discriminator, the value of type is usually calculated by hash
   * function in following way: hash(<Component>.name)
   */
  readonly type: number;

  /**
   * The unix timestamp when component lastly patched.
   */
  readonly timestamp: timestamp;
}
