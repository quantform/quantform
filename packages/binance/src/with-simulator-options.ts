import { useOptions } from './use-options';

export const withSimulatorOptions = () => {
  const { simulator } = useOptions();

  if (!simulator) {
    throw new Error('missing simulator options');
  }

  return simulator;
};
