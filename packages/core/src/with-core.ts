import { Dependency } from '@lib/module';
import { inMemoryStorage } from '@lib/storage';
import { memo } from '@lib/use-memo';

import { paperExecutionMode } from './use-execution-mode';

export function withCore(): Dependency[] {
  return [memo(), paperExecutionMode({ recording: false }), inMemoryStorage()];
}
