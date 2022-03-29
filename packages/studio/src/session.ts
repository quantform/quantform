import { Session } from '@quantform/core';

export type SessionAccessor = {
  session?: Session;
};

let sessionAccessor: SessionAccessor;

if (process.env.NODE_ENV === 'production') {
  sessionAccessor = {
    session: undefined
  };
} else {
  if (!global.sessionAccessor) {
    global.sessionAccessor = {
      session: undefined
    };
  }
  sessionAccessor = global.sessionAccessor;
}

export default sessionAccessor;
