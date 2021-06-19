import { SessionDescriptor } from '@quantform/core';
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
import { JobQueue } from './job-queue';
import * as express from 'express';
import * as path from 'path';
const { defaultMetadataStorage } = require('class-transformer/cjs/storage');

useContainer(Container);

Container.set('feed', new JobQueue());
Container.set('backtest', new JobQueue());

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

  app.use(express.static(path.join(__dirname, '../editor/build')));
  app.use('/docs', swaggerUiExpress.serve, swaggerUiExpress.setup(spec));

  app.get('/editor/*', (_, res) => {
    res.sendFile(path.join(__dirname + '/../editor/build/index.html'));
  });

  const server = app.listen(port, () => {
    if (process && process.send) {
      process.send({
        event: 'ready',
        port: server.address().port
      });
    }
  });
}

//serve(3001);
