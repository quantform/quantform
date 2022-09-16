import * as chalk from 'chalk';

import { now } from './datetime';

const colorize = (content: string) => {
  let hash = 0x811c9dc5;

  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return chalk.hex('#' + (hash * 0xfffff * 1000000).toString(16).slice(0, 6))(content);
};

const time = () => chalk.gray(new Date(now()).toISOString());

export class Logger {
  public static info = (context: string, message: string) =>
    console.info(`${time()} ${colorize(context)}: ${message}`);

  public static debug = (context: string, message: string) =>
    console.debug(`${time()} ${colorize(context)}: ${message}`);

  public static warn = (context: string, message: string) =>
    console.warn(`${time()} ${colorize(context)}: ${message}`);

  public static error = (context: string, error: unknown) => {
    let message = 'Unknown Error';

    if (error instanceof Error) {
      message = error.message;
    }

    console.error(`${time()} ${colorize(context)}: ${message}`);
  };
}
