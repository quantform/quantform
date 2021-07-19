import events = require('events');
import { Service } from 'typedi';

@Service()
export class EventDispatcher extends events.EventEmitter {
  constructor() {
    super();
  }
}
