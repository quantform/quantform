export function fit(key: string, generator?: any[]) {
  return function (target: any, propertyKey: string) {
    let defaultSetterValue;

    if (generator) {
      SessionOptimizerGenerator.values[key] = generator;
    }

    Object.defineProperty(target, propertyKey, {
      get: () => SessionOptimizer.provide(key) ?? defaultSetterValue,
      set: (newValue: any) => {
        if (!defaultSetterValue) {
          defaultSetterValue = newValue;
          return;
        }

        if (defaultSetterValue == newValue) {
          return;
        }

        throw new Error('can not set a value of optimized property.');
      }
    });
  };
}

export class SessionOptimizer {
  static source: any = {};

  static provide(key: string): any {
    return key
      .split('.')
      .reduce(
        (aggregate, propertyName) => (aggregate ? aggregate[propertyName] : null),
        this.source
      );
  }
}

export class SessionOptimizerGenerator {
  static values: Record<string, any[]> = {};

  static get count(): number {
    return Object.values(this.values).reduce(
      (aggregate, value) => (aggregate *= value.length),
      1
    );
  }

  static product(): any[] {
    const matrix = [];
    const keys = Object.keys(this.values);
    const values = Object.values(this.values).reduce(
      (a, b) => a.map(x => b.map(y => x.concat(y))).reduce((a, b) => a.concat(b), []),
      [[]]
    );

    for (const value of values) {
      const result = {};

      for (let i = 0; i < keys.length; i++) {
        const path = keys[i];
        const parts = path.split('.');

        let it = result;

        while (parts.length > 1) {
          const part = parts.shift();

          it = it[part] = it[part] || {};
        }

        it[parts[0]] = value[i];
      }

      matrix.push(result);
    }

    return matrix;
  }
}
