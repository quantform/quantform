import { EventEmitter } from 'stream';

export type Work = () => Promise<void>;

export class Worker extends EventEmitter {
  private readonly queue = new Array<Work>();
  private promise: Promise<void>;

  enqueue(job: Work) {
    this.queue.push(job);

    this.tryNext();
  }

  wait(): Promise<void> {
    if (!this.queue.length) {
      return Promise.resolve();
    }

    return new Promise<void>(resolve => {
      const listener = () => {
        if (this.queue.length) {
          return;
        }

        this.removeListener('completed', listener);

        resolve();
      };

      this.addListener('completed', listener);
    });
  }

  private tryNext() {
    if (!this.queue.length) {
      return;
    }

    if (!this.promise) {
      const queued = this.queue[0];

      this.emit('started');

      this.promise = queued().finally(() => {
        this.queue.shift();

        this.promise = null;

        this.emit('completed');
        this.tryNext();
      });
    }
  }
}
