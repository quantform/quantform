import * as chalk from 'chalk';

const colorize = (content: string) => {
  let hash = 0x811c9dc5;

  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return chalk.hex('#' + ('0000000' + (hash >>> 0).toString(16)).substr(-8))(content);
};

export class Logger {
  public static info = (context: string, message: string) =>
    console.info(`${colorize(context)}: ${message}`);

  public static debug = (context: string, message: string) =>
    console.debug(`${colorize(context)}: ${message}`);

  public static warn = (context: string, message: string) =>
    console.warn(`${colorize(context)}: ${message}`);

  public static error = (context: string, message: string) =>
    console.error(`${colorize(context)}: ${message}`);
}
