import { Timeframe } from '../domain';
import { SessionOptimizer, fit, SessionOptimizerGenerator } from './session.optimizer';

describe('session optimizer tests', () => {
  test('should ignore not provided value for property', () => {
    class Target {
      @fit('timeframe')
      timeframe = Timeframe.H1;
    }

    const sut = new Target();

    expect(sut.timeframe).toBe(Timeframe.H1);
  });

  test('should ignore not provided descendant value for property', () => {
    class Target {
      @fit('timeframe.daily')
      timeframe = Timeframe.H1;
    }

    const sut = new Target();

    expect(sut.timeframe).toBe(Timeframe.H1);
  });

  test('should set provided value for property', () => {
    class Target {
      @fit('timeframe')
      timeframe = Timeframe.H1;
    }

    SessionOptimizer.source = {
      timeframe: Timeframe.D1
    };

    const sut = new Target();

    expect(sut.timeframe).toBe(Timeframe.D1);
  });

  test('should set provided descendant value for property', () => {
    class Target {
      @fit('timeframe.daily')
      timeframe = Timeframe.H1;
    }

    SessionOptimizer.source = {
      timeframe: {
        daily: Timeframe.D1
      }
    };

    const sut = new Target();

    expect(sut.timeframe).toBe(Timeframe.D1);
  });
});

describe('optimizer generator tests', () => {
  test('should generate optimized input', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Target {
      @fit('target.timeframe', [Timeframe.D1, Timeframe.H1])
      timeframe;
      @fit('target.length', [7, 14, 21])
      length;
      @fit('target.size', [0.1, 0.2, 0.3, 0.4])
      size;
    }

    expect(SessionOptimizerGenerator.count).toBe(24);

    const product = SessionOptimizerGenerator.product();

    expect(product.length).toBe(24);

    expect(product[0].target.timeframe).toBe(Timeframe.D1);
    expect(product[0].target.length).toBe(7);
    expect(product[0].target.size).toBe(0.1);

    expect(product[23].target.timeframe).toBe(Timeframe.H1);
    expect(product[23].target.length).toBe(21);
    expect(product[23].target.size).toBe(0.4);
  });
});
