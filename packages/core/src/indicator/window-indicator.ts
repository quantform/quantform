import { RingBuffer } from './ring-buffer';

export abstract class WindowIndicator<T> {
  private _buffer: RingBuffer<T>;

  get capacity(): number {
    return this._buffer.capacity;
  }

  get size(): number {
    return this._buffer.size;
  }

  get isCompleted(): boolean {
    return this._buffer.isFull;
  }

  constructor(capacity: number) {
    this._buffer = new RingBuffer<T>(capacity);
  }

  abstract calculate(added: T, removed: T, buffer: RingBuffer<T>);

  public append(value: T) {
    let removed = null;

    if (this.isCompleted) {
      removed = this._buffer.peek();
    }

    this._buffer.enqueue(value);

    this.calculate(value, removed, this._buffer);
  }
}
