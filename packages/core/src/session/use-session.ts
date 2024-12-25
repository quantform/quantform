import { Dependency, useContext } from '@lib/module';

const token = Symbol('session-options');

type SessionOptions = {
  id: string;
};

/**
 *
 */
export function sessionOptions(options: SessionOptions): Dependency {
  return {
    provide: token,
    useValue: options
  };
}

/**
 * Will return current replay execution options.
 */
export const useSession = () => useContext<SessionOptions>(token);
