import { Logger } from '@quantform/core';
import { createServer } from 'http';
import next from 'next';
import { join } from 'path';
import { parse } from 'url';

export async function createNextServer(port: number) {
  const dev = false; //process.env.NODE_ENV !== 'production';
  const hostname = 'localhost';
  const dir = join(__dirname, '../../');

  const app = next({
    dev,
    hostname,
    port,
    dir
  });

  const handle = app.getRequestHandler();

  await app.prepare();

  await new Promise(resolve => {
    createServer(async (req, res) => {
      if (!req.url) {
        throw new Error('missing url');
      }

      try {
        await handle(req, res, parse(req.url, true));
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    }).listen(port, undefined, undefined, () => {
      Logger.info('studio', `ready on http://${hostname}:${port}`);

      resolve(0);
    });
  });
}
