import { useOptions } from '@lib/use-options';

export const useSimulatorOptions = () => {
  const { simulator } = useOptions();

  if (!simulator) {
    throw new Error('missing simulator options');
  }

  return simulator;
};
