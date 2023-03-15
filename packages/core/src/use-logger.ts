import chalk from 'chalk';

import { useTimestamp } from './use-timestamp';
import { withMemo } from './with-memo';

/**
 *
 */
export const useLogger = withMemo((context: string, tint: string) => {
  const prefix = () =>
    `${chalk.gray(new Date(useTimestamp()).toISOString())} ${chalk.hex(tint)(context)}`;

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
        ? console.error(`${prefix()}: ${message}`, params)
        : console.error(`${prefix()}: ${message}`)
  };
});
