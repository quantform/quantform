export class RingBuffer<T> {
  private items = new Array<T>(this.capacity);
  private first = 0;
  private last = 0;
  private length = 0;

  get size(): number {
    return this.length;
  }

  get isEmpty(): boolean {
    return this.size == 0;
  }

  get isFull(): boolean {
    return this.size == this.capacity;
  }

  constructor(readonly capacity: number) {}

  peek(): T {
    return this.items[this.first];
  }

  dequeue(): T {
    const element = this.peek();

    this.length--;
    this.first = (this.first + 1) % this.capacity;

    return element;
  }

  enqueue(element: T): T | null {
    this.last = (this.first + this.size) % this.capacity;
    const full = this.isFull;
    let removed = null;

    if (full) {
      removed = this.items[this.last];
    }

    this.items[this.last] = element;

    if (full) {
      this.first = (this.first + 1) % this.capacity;
    } else {
      this.length++;
    }

    return removed;
  }

  forEach(fn: (value: T, index: number) => void) {
    for (let i = 0; i < this.size; i++) {
      fn(this.at(i), i);
    }
  }

  at(index: number): T {
    return this.items[(this.first + index) % this.capacity];
  }
}
