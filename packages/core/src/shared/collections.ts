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
    this.array.forEach((it, idx) => {
      if (it.id == value.id) {
        this.array[idx] = value;

        return value;
      }
    });

    this.array.push(value);

    return value;
  }

  asReadonlyArray(): ReadonlyArray<T> {
    return this.array;
  }
}

export class PriorityList<T extends { next: T }> {
  private readonly valueByKey: Record<any, T> = {};

  head: T;

  constructor(
    private readonly comparer: (lhs: Omit<T, 'next'>, rhs: Omit<T, 'next'>) => number,
    private readonly key: keyof Omit<T, 'next'>
  ) {}

  getByKey(key: any): T {
    return this.valueByKey[key];
  }

  private make(value: Omit<T, 'next'>, next: T = undefined): T {
    const node = { ...value, next } as T;

    this.valueByKey[node[this.key].toString()] = node;

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

      delete this.valueByKey[value[this.key].toString()];
    }

    this.visit(it => {
      if (it.next && this.comparer(it.next, value) == 0) {
        it.next = it.next.next;

        delete this.valueByKey[value[this.key].toString()];

        return false;
      }
    });
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
