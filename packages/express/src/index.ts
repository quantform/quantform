import {
  InMemoryFeed,
  instrumentOf,
  Measurement,
  Session,
  session,
  SessionDescriptor
} from '@quantform/core';
import { BinanceAdapter } from '@quantform/binance';
import { SQLiteFeed, SQLiteMeasurement } from '@quantform/sqlite';
import { SessionDescriptorRegistry } from './session/session-descriptor.registry';
import {
  createExpressServer,
  useContainer,
  getMetadataArgsStorage
} from 'routing-controllers';
import { Container } from 'typedi';
import { FeedController } from './feed/feed.controller';
import { MeasurementController } from './measurement/measurement.controller';
import 'reflect-metadata';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUiExpress from 'swagger-ui-express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { DescriptorController } from './descriptor/descriptor.controller';
import { SessionController } from './session/session.controller';
import { EventController } from './event/event.controller';
const { defaultMetadataStorage } = require('class-transformer/cjs/storage');

useContainer(Container);

export function serve(port: number, ...descriptors: SessionDescriptor[]) {
  const registry = Container.get(SessionDescriptorRegistry);

  for (const descriptor of descriptors) {
    registry.register(descriptor);
  }

  const routingControllersOptions = {
    cors: true,
    controllers: [
      EventController,
      SessionController,
      FeedController,
      DescriptorController,
      MeasurementController
    ]
  };

  const app = createExpressServer(routingControllersOptions);

  const schemas = validationMetadatasToSchemas({
    classTransformerMetadataStorage: defaultMetadataStorage,
    refPointerPrefix: '#/components/schemas/'
  });

  const storage = getMetadataArgsStorage();
  const spec = routingControllersToSpec(storage, routingControllersOptions, {
    components: {
      schemas,
      securitySchemes: {
        basicAuth: {
          scheme: 'basic',
          type: 'http'
        }
      }
    }
  });

  app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));
  app.use('/', (_, res) => res.json(spec));

  app.listen(port);
}

@session('momentum')
export class MomentumStrategy extends SessionDescriptor {
  adapter() {
    return [new BinanceAdapter()];
  }

  feed() {
    return new InMemoryFeed();
  }

  measurement(): Measurement {
    return new SQLiteMeasurement();
  }

  async awake(session: Session) {
    session
      .orderbook(instrumentOf('binance:btc-usdt'))
      .subscribe(it => console.log(it.midRate));
  }
}

serve(3001, new MomentumStrategy());