export class Set<T extends { id: string }> {
  private readonly array: Array<T> = [];

  constructor(values?: ReadonlyArray<T>) {
    if (values) {
      values.forEach(it => this.upsert(it));
    }
  }

  get(id: string) {
    return this.array.find(it => it.id == id);
  }

  tryGetOrSet(id: string, setter: () => T): T {
    return this.get(id) ?? this.upsert(setter());
  }

  upsert(value: T) {
    const index = this.array.findIndex(it => it.id == value.id);

    if (index >= 0) {
      this.array[index] = value;

      return value;
    }

    this.array.push(value);

    return value;
  }

  remove(value: T) {
    const index = this.array.indexOf(value);
    if (index > -1) {
      this.array.splice(index, 1);
    }
  }

  asReadonlyArray(): ReadonlyArray<T> {
    return this.array;
  }

  clear() {
    this.array.splice(0, this.array.length);
  }
}

export class PriorityList<T extends { next: T | undefined }> {
  private valueByKey: Record<string, T> = {};

  head: T | undefined;

  constructor(
    private readonly comparer: (lhs: Omit<T, 'next'>, rhs: Omit<T, 'next'>) => number,
    private readonly getKeyFn: (key: Omit<T, 'next'>) => string
  ) {}

  getByKey(key: string): T {
    return this.valueByKey[key];
  }

  private make(value: Omit<T, 'next'>, next: T | undefined = undefined): T {
    const node = { ...value, next } as T;

    this.valueByKey[this.getKeyFn(node)] = node;

    return node;
  }

  enqueue(value: Omit<T, 'next'>) {
    if (!this.head) {
      this.head = this.make(value);
    }

    if (this.comparer(this.head, value) > 0) {
      this.head = this.make(value, this.head);
    } else if (this.comparer(this.head, value) == 0) {
      this.head = this.make(value, this.head.next);
    } else {
      this.visit(it => {
        if (it.next) {
          if (this.comparer(it.next, value) == 0) {
            it.next = this.make(value, it.next.next);

            return false;
          }

          if (this.comparer(it.next, value) > 0) {
            it.next = this.make(value, it.next);

            return false;
          }

          return true;
        } else {
          it.next = this.make(value);

          return false;
        }
      });
    }
  }

  dequeue(value: Omit<T, 'next'>) {
    if (!this.head) {
      return;
    }

    if (this.comparer(this.head, value) == 0) {
      this.head = this.head.next;

      delete this.valueByKey[this.getKeyFn(value)];
    }

    this.visit(it => {
      if (it.next && this.comparer(it.next, value) == 0) {
        it.next = it.next.next;

        delete this.valueByKey[this.getKeyFn(value)];

        return true;
      }

      return false;
    });
  }

  clear() {
    this.head = undefined;
    this.valueByKey = {};
  }

  visit(fn: (value: T) => boolean) {
    let top = this.head;

    while (top) {
      if (!fn(top)) {
        break;
      }

      top = top.next;
    }
  }

  reduce<K>(fn: (value: T, aggregate: K) => K, initValue: K) {
    this.visit(it => {
      initValue = fn(it, initValue);

      return true;
    });

    return initValue;
  }
}
