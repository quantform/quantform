import { useOptions } from '@lib/use-options';

export const useCredentials = () => {
  const { apiKey, apiSecret } = useOptions();

  if (!apiKey || !apiSecret) {
    throw new Error('missing api key or secret!');
  }

  return { apiKey, apiSecret };
};
