import type { Event } from './event';

export type EventHandler<E extends Event> = ((event: E) => void) & { eventType: E['type'] };

export type StateFactory<S extends Event> = (context: {
  apply: (e: S) => void;
  on: <T extends S['type']>(
    type: T,
    fn: (event: Extract<S, { type: T }>) => void
  ) => EventHandler<S>;
}) => EventHandler<S>[];

export function useState<E extends Event>(
  factory: StateFactory<E>
): StateFactory<E> {
  return factory;
}
