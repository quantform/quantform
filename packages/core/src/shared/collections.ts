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
