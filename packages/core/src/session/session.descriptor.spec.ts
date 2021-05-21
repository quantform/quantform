import {
  spawn,
  session,
  SessionDescriptor,
  SessionDescriptorContainer
} from './session.descriptor';

@session('hidden')
class HiddenSession extends SessionDescriptor {
  options() {
    return {
      feed: null,
      from: 1,
      to: 2,
      balance: {}
    };
  }

  adapter() {
    return [];
  }
}

describe('session descriptor tests', () => {
  test('create deafult session descriptor', () => {
    spawn(new HiddenSession());

    const session = SessionDescriptorContainer.resolve();
    const options = session.options();

    expect(options.from).toBe(1);
  });
});
