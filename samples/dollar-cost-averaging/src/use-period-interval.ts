import { interval } from 'rxjs';

export function usePeriodInterval() {
  return interval(1000);
}
