import { Database } from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
const bettersqlite3 = require('better-sqlite3');

export abstract class SQLiteConnection {
  protected connection: Database;

  constructor(
    protected readonly options?: {
      filename?: string;
      limit?: number;
    }
  ) {}

  protected tryConnect() {
    if (this.connection) {
      return;
    }

    const filename = this.getDatabaseFilename();

    if (!existsSync(dirname(filename))) {
      mkdirSync(dirname(filename), { recursive: true });
    }

    this.connection = bettersqlite3(filename);
  }

  abstract getDatabaseFilename();
}
