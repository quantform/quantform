import events = require('events');
import { Service } from 'typedi';

@Service()
export class EventDispatcher extends events.EventEmitter {
  constructor() {
    super();

    this.on('feed-started', payload => console.log('started'));
    this.on('feed-progress', payload => console.log('progress'));
    this.on('feed-completed', payload => console.log('completed'));
  }
}
