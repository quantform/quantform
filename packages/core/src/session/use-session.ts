import { Dependency, useContext } from '@lib/module';

const token = Symbol('session-options');

type SessionOptions = {
  id: string;
};

/**
 * Will return current replay execution options.
 */
export const useSession = () => useContext<SessionOptions>(token);

useSession.options = (options: SessionOptions): Dependency => ({
  provide: token,
  useValue: options
});
