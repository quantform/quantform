export class RingBuffer<T> {
  private _elements = new Array<T>(this.capacity);
  private _first = 0;
  private _last = 0;
  private _size = 0;

  get size(): number {
    return this._size;
  }

  get isEmpty(): boolean {
    return this.size == 0;
  }

  get isFull(): boolean {
    return this.size == this.capacity;
  }

  constructor(readonly capacity: number) {}

  peek(): T {
    return this._elements[this._first];
  }

  dequeue(): T {
    const element = this.peek();

    this._size--;
    this._first = (this._first + 1) % this.capacity;

    return element;
  }

  enqueue(element: T): T {
    this._last = (this._first + this.size) % this.capacity;
    const full = this.isFull;
    let removed = null;

    if (full) {
      removed = this._elements[this._last];
    }

    this._elements[this._last] = element;

    if (full) {
      this._first = (this._first + 1) % this.capacity;
    } else {
      this._size++;
    }

    return removed;
  }

  forEach(fn: (value: T, index: number) => void) {
    for (let i = 0; i < this.size; i++) {
      fn(this.at(i), i);
    }
  }

  at(index: number): T {
    return this._elements[(this._first + index) % this.capacity];
  }
}
