export type Job = () => Promise<void>;

export class JobQueue {
  private readonly queue = new Array<Job>();
  private promise: Promise<void>;

  enqueue(job: Job) {
    this.queue.push(job);

    this.tryNext();
  }

  private tryNext() {
    if (!this.queue.length) {
      return;
    }

    if (!this.promise) {
      const queued = this.queue[0];

      this.promise = queued().finally(() => {
        this.queue.shift();

        this.promise = null;
        this.tryNext();
      });
    }
  }
}
