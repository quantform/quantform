import { getInstrument } from './get-instrument';
import { getInstruments } from './get-instruments';
import { getUser } from './get-user';

export function usePerpetual() {
  return {
    getInstrument,
    getInstruments,
    getUser
  };
}
