import { lastValueFrom, Observable } from 'rxjs';
import { Session } from './../session';

declare type Task = (session: Session) => Observable<any> | Promise<any> | any;

const tasks: Record<string, Task> = {};

export function task(name: string, fn: Task) {
  tasks[name] = fn;
}

export async function runTask(name: string, session: Session): Promise<void> {
  const task = tasks[name];

  if (!task) {
    throw new Error('Unknown task: ' + name);
  }

  const result = tasks[name](session);

  if (result instanceof Observable) {
    return lastValueFrom(result);
  }

  if (result instanceof Promise) {
    return await result;
  }

  return result;
}
