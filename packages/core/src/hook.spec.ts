import {} from 'decimal.js';

const MyReact = (() => {
  const stack = Array.of<Record<string, any>>();
  const frame = () => stack[stack.length - 1];

  return {
    act: <T>(func: () => T) => {
      stack.push({});

      try {
        return func.apply(this);
      } finally {
        stack.pop();
      }
    },

    useState: <T>(val: T): [T, (v: T) => void] => {
      const f = frame();

      if (f.ddd === undefined) {
        f.ddd = val;
      }

      return [
        f.ddd as T,
        (v: T) => {
          f.ddd = v;
        }
      ];
    }
  };
})();

function useValue(): number {
  const [v, setV] = MyReact.useState(3);

  return v;
}

describe('hooks', () => {
  test('execute', async () => {
    const r = MyReact.act(() => {
      const n = useValue();

      const p = () => 0;

      return n;
    });

    expect(r).toEqual(3);
  });
});
