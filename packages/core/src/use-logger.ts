import chalk from 'chalk';

import { useTimestamp } from './use-timestamp';
import { withMemo } from './with-memo';

const colorize = (content: string) => {
  let hash = 0x811c9dc5;

  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return chalk.hex('#' + (hash * 0xfffff * 1000000).toString(16).slice(0, 6))(content);
};

/**
 *
 */
export const useLogger = withMemo((context: string, tint?: string) => {
  const prefix = () =>
    `${chalk.gray(new Date(useTimestamp()).toISOString())} ${chalk.hex(
      tint ?? colorize(context)
    )(context)}`;

  return {
    info: (message: any, ...params: unknown[]) =>
      params?.length
        ? console.info(`${prefix()}: ${message}`, params)
        : console.info(`${prefix()}: ${message}`),

    debug: (message: any, ...params: unknown[]) =>
      params?.length
        ? console.debug(`${prefix()}: ${message}`, params)
        : console.debug(`${prefix()}: ${message}`),

    warn: (message: any, ...params: unknown[]) =>
      params?.length
        ? console.warn(`${prefix()}: ${message}`, params)
        : console.warn(`${prefix()}: ${message}`),

    error: (message: any, ...params: unknown[]) =>
      params?.length
        ? console.error(`${prefix()}: ${chalk.red(message)}`, params)
        : console.error(`${prefix()}: ${chalk.red(message)}`)
  };
});
