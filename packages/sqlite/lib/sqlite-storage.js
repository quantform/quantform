"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteStorage = exports.sqlite = void 0;
const core_1 = require("@quantform/core");
const bettersqlite3 = require("better-sqlite3");
const fs_1 = require("fs");
const path_1 = require("path");
const error_1 = require("./error");
function sqlite(directory) {
    return (type) => new SQLiteStorage((0, path_1.join)(directory !== null && directory !== void 0 ? directory : (0, core_1.workingDirectory)(), `/${type}.sqlite`));
}
exports.sqlite = sqlite;
class SQLiteStorage {
    constructor(filename) {
        this.filename = filename;
    }
    tryConnect() {
        if (this.connection) {
            return;
        }
        if (!(0, fs_1.existsSync)((0, path_1.dirname)(this.filename))) {
            (0, fs_1.mkdirSync)((0, path_1.dirname)(this.filename), { recursive: true });
        }
        this.connection = bettersqlite3(this.filename);
    }
    tryCreateTable(table) {
        if (!this.connection) {
            throw (0, error_1.noConnectionError)();
        }
        this.connection.exec(`CREATE TABLE IF NOT EXISTS "${table}" (
          timestamp INTEGER NOT NULL, 
          kind TEXT NOT NULL, 
          json TEXT NOT NULL, 
          PRIMARY KEY (timestamp, kind)
        )`);
    }
    index() {
        return __awaiter(this, void 0, void 0, function* () {
            this.tryConnect();
            if (!this.connection) {
                throw (0, error_1.noConnectionError)();
            }
            return this.connection
                .prepare("SELECT name FROM sqlite_master WHERE type='table'")
                .all()
                .map(it => it.name);
        });
    }
    query(library, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            this.tryConnect();
            if (!this.connection) {
                throw (0, error_1.noConnectionError)();
            }
            if (!this.connection
                .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='${library}'`)
                .all().length) {
                return [];
            }
            const isBackward = options.from == undefined;
            let rows = this.connection
                .prepare(`SELECT * FROM "${library}"
           WHERE timestamp > ? AND timestamp < ? ${options.kind ? `AND kind = '${options.kind}'` : ''}
           ORDER BY timestamp ${isBackward ? 'DESC' : ''}
           LIMIT ?`)
                .all([(_a = options.from) !== null && _a !== void 0 ? _a : 0, (_b = options.to) !== null && _b !== void 0 ? _b : Number.MAX_VALUE], Math.min(options.count, 50000));
            if (isBackward) {
                rows = rows.reverse();
            }
            return rows;
        });
    }
    save(library, documents) {
        return __awaiter(this, void 0, void 0, function* () {
            this.tryConnect();
            if (!this.connection) {
                throw (0, error_1.noConnectionError)();
            }
            this.tryCreateTable(library);
            const statement = this.connection.prepare(`
      REPLACE INTO "${library}" (timestamp, kind, json)
      VALUES(?, ?, ?); 
    `);
            const insertMany = this.connection.transaction(rows => rows.forEach((it) => statement.run(it.timestamp, it.kind, it.json)));
            insertMany(documents);
        });
    }
}
exports.SQLiteStorage = SQLiteStorage;
