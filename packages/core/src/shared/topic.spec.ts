import { Topic, handler, event } from './topic';

describe('topic tests', () => {
  test('string as key cache', () => {
    interface Event {
      type: string;
    }

    interface Context {
      counter: number;
    }

    const context = <Context>{
      counter: 1
    };

    @event
    class IncrementEvent implements Event {
      type = 'increment';
    }

    class MathematicBaseTopic extends Topic<Event, Context> {}
    class MathematicTopic extends MathematicBaseTopic {
      @handler(IncrementEvent)
      increment(event: IncrementEvent, context: Context) {
        context.counter++;
      }
    }

    new MathematicTopic().dispatch(new IncrementEvent(), context);

    expect(context.counter).toBe(2);
  });
});
