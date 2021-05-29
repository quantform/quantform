import { Get, JsonController, QueryParam, Req, Res } from 'routing-controllers';
import { Request, Response } from 'express';
import { Service } from 'typedi';
import { EventDispatcher } from './event.dispatcher';
import 'reflect-metadata';

@JsonController('/event')
@Service()
export class EventController {
  constructor(private readonly dispatcher: EventDispatcher) {}

  @Get()
  async connect(
    @QueryParam('context') context: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    req.socket.setTimeout(Number.MAX_VALUE);

    const handler = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const disconnect = (err?: any) => {
      this.dispatcher.removeListener(context, handler);
    };

    this.dispatcher.on(context, handler);

    req.on('close', disconnect);
    req.on('finish', disconnect);
    req.on('error', disconnect);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    res.write(': open stream\n\n');
  }
}
