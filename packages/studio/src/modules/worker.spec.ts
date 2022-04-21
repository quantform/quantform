import { Worker } from './worker';

describe('worker tests', () => {
  test('event handler tests', async () => {
    const sut = new Worker();

    let started = 0,
      completed = 0;

    sut.addListener('started', () => started++);
    sut.addListener('completed', () => completed++);

    sut.enqueue(
      () =>
        new Promise<void>(resolve => {
          setTimeout(() => resolve(), 1);
        })
    );

    await sut.wait();

    expect(started).toBe(1);
    expect(completed).toBe(1);
  });
});
