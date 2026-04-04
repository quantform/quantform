import { useExecutionMode } from '@lib/use-execution-mode';

import { useReplayScheduler } from './replay';

export type Unit = 'ns' | 'us' | 'ms' | 's';

export type Timestamp<Unit> = bigint & { readonly __unit: Unit };

const baseMs = Date.now();
const baseHr = process.hrtime.bigint();

export function now(): Timestamp<'ns'> {
  const offset = process.hrtime.bigint() - baseHr;

  return (BigInt(baseMs) * 1_000_000n + offset) as Timestamp<'ns'>;
}

export const ns = (value: bigint | number): Timestamp<'ns'> =>
  BigInt(value) as Timestamp<'ns'>;
export const us = (value: bigint | number): Timestamp<'us'> =>
  BigInt(value) as Timestamp<'us'>;
export const ms = (value: bigint | number): Timestamp<'ms'> =>
  BigInt(value) as Timestamp<'ms'>;
export const s = (value: bigint | number): Timestamp<'s'> =>
  BigInt(value) as Timestamp<'s'>;

const factors = {
  ns: 1n,
  us: 1_000n,
  ms: 1_000_000n,
  s: 1_000_000_000n
} as const;

export function convert<F extends Unit, T extends Unit>(
  value: Timestamp<F>,
  from: F,
  to: T
): Timestamp<T> {
  const ns = BigInt(value) * factors[from];

  return BigInt(ns / factors[to]) as Timestamp<T>;
}

export function add<U extends Unit>(a: Timestamp<U>, b: Timestamp<U>): Timestamp<U> {
  return (a + b) as Timestamp<U>;
}

export function useTimestamp(): { timestamp: Timestamp<'ns'> } {
  const { isReplay } = useExecutionMode();

  if (isReplay) {
    return { timestamp: useReplayScheduler().timestamp() };
  }

  return { timestamp: now() };
}
