export class Mediator {
  private readonly container: Record<string, any> = {};

  register(message: string, handler: { handle: (request: any) => any }) {
    this.container[message] = handler;
  }

  send<TRequest extends { name: string }, TResponse>(request: TRequest): TResponse {
    return this.container[request.name]?.handle(request);
  }
}

export function handler<TRequest extends { name: string }, TResponse>(
  mediator: Mediator,
  message: string
): (target: new () => { handle(request: TRequest): TResponse }) => void {
  return (target: new () => { handle(request: TRequest): TResponse }) => {
    mediator.register(message, new target());
  };
}
