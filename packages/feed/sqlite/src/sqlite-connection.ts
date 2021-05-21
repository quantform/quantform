import { Database } from 'sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export abstract class SQLiteConnection {
  protected connection: Database;

  constructor(
    protected readonly options?: {
      filename?: string;
      limit?: number;
    }
  ) {}

  protected async tryConnect(): Promise<void> {
    if (this.connection) {
      return;
    }

    const filename = this.getDatabaseFilename();

    if (!existsSync(dirname(filename))) {
      mkdirSync(dirname(filename), { recursive: true });
    }

    await new Promise<void>(async resolve => {
      this.connection = new Database(filename, error => {
        if (error) {
          throw new Error(error.message);
        } else {
          resolve();
        }
      });
    });
  }

  abstract getDatabaseFilename();
}
