import { handler, Mediator } from './mediator';

export class InrementRequest {
  name = 'increment';

  constructor(readonly value: number) {}
}

class Math {
  static readonly mediator = new Mediator();

  increment(value: number): number {
    return Math.mediator.send(new InrementRequest(value));
  }
}

@handler<InrementRequest, number>(Math.mediator, 'increment')
export class IncrementHandler {
  handle(request: InrementRequest): number {
    return request.value + 1;
  }
}

describe('mediator tests', () => {
  test('create handler', () => {
    const math = new Math();

    expect(math.increment(1)).toBe(2);
  });
});
