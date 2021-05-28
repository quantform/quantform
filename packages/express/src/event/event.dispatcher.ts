import events = require('events');
import { Service } from 'typedi';

@Service()
export class EventDispatcher extends events.EventEmitter {
  constructor() {
    super();

    this.on('session-started', payload => console.log('started', payload));
    this.on('session-update', payload => console.log('progress', payload));
    this.on('session-completed', payload => console.log('completed', payload));
  }
}
