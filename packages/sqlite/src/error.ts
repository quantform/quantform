export class NoConnectionError extends Error {
  constructor() {
    super('Missing database connection connection!');
  }
}
