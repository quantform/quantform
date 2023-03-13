import chalk from 'chalk';

import { now } from '@lib/shared';

const colorize = (content: string) => {
  let hash = 0x811c9dc5;

  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return chalk.hex('#' + (hash * 0xfffff * 1000000).toString(16).slice(0, 6))(content);
};

export class Logger {
  constructor(
    private readonly context: string,
    private readonly hexColor: string,
    private readonly getTimestamp: () => number
  ) {}

  public info = (message: any, ...params: unknown[]) =>
    params?.length
      ? console.info(`${this.prefix()}: ${message}`, params)
      : console.info(`${this.prefix()}: ${message}`);

  public debug = (message: any, ...params: unknown[]) =>
    params?.length
      ? console.debug(`${this.prefix()}: ${message}`, params)
      : console.debug(`${this.prefix()}: ${message}`);

  public warn = (message: any, ...params: unknown[]) =>
    params?.length
      ? console.warn(`${this.prefix()}: ${message}`, params)
      : console.warn(`${this.prefix()}: ${message}`);

  public error = (message: any, ...params: unknown[]) =>
    params?.length
      ? console.error(`${this.prefix()}: ${message}`, params)
      : console.error(`${this.prefix()}: ${message}`);

  public prefix = () =>
    `${chalk.gray(new Date(this.getTimestamp()).toISOString())} ${chalk.hex(
      this.hexColor
    )(this.context)}`;
}
