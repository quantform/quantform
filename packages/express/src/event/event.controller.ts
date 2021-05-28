import { JsonController } from 'routing-controllers';
import { Service } from 'typedi';
import { EventDispatcher } from './event.dispatcher';
import 'reflect-metadata';

@JsonController('/event')
@Service()
export class EventController {
  constructor(private readonly dispatcher: EventDispatcher) {}
}
