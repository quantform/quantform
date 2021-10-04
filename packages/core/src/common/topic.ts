import 'reflect-metadata';

export class Topic<T extends { type: string } = { type: string }, C = {}> {
  private readonly handler: Record<string, Function> = {};

  constructor() {
    this.register(this);
  }

  register(target: any) {
    for (const key of Reflect.getMetadataKeys(target.constructor.prototype)) {
      if (!key.startsWith('event:')) {
        continue;
      }

      this.handler[key] = Reflect.getMetadata(key, target.constructor.prototype);
    }
  }

  dispatch(event: T & any, context: C): any {
    const handler = this.handler['event:' + event.type];

    return handler
      ? handler.call(this, event, context)
      : this.onUnknownEvent(event, context);
  }

  onUnknownEvent(event: T, context: C) {
    throw new Error(`No handler for event ${event.type}`);
  }
}

export function handler(event: any) {
  return function(target: any, key: string) {
    const type = Reflect.getMetadata('event:type', event.prototype);

    Reflect.defineMetadata('event:' + type, target[key], target);
  };
}

export const event = (target: any) => {
  Reflect.defineMetadata('event:type', new target().type, target.prototype);
};
