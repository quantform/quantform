import {
  InferQueryObject,
  Query,
  QueryMappingType,
  QueryObject,
  QueryObjectType,
  QueryWhere
} from '@quantform/core';

export class SQLiteLanguage {
  static getType(type: QueryMappingType) {
    switch (type) {
      case 'number':
        return 'INTEGER';
      case 'decimal':
        return 'TEXT';
      case 'string':
        return 'TEXT';
    }
  }

  static getValue(type: QueryMappingType, value: any) {
    switch (type) {
      case 'number':
        return value;
      case 'decimal':
        return `'${value.toString()}'`;
      case 'string':
        return `'${value}'`;
    }
  }

  static getConstraint(
    columnName: string,
    type: QueryMappingType,
    constraint: QueryWhere
  ) {
    switch (constraint?.type) {
      case 'eq':
        return `${columnName} = ${SQLiteLanguage.getValue(type, constraint.value)}`;
      case 'gt':
        return `${columnName} > ${SQLiteLanguage.getValue(type, constraint.value)}`;
      case 'lt':
        return `${columnName} < ${SQLiteLanguage.getValue(type, constraint.value)}`;
      case 'between':
        return `${columnName} > ${SQLiteLanguage.getValue(
          type,
          constraint.min
        )} AND ${columnName} < ${SQLiteLanguage.getValue(type, constraint.max)}`;
    }
  }

  static createTable<T extends QueryObjectType<K>, K extends QueryObject>(type: T) {
    const columns = `${Object.entries(type.type)
      .map(([name, type]) => `${name} ${SQLiteLanguage.getType(type)} NOT NULL`)
      .join(', ')}`;

    return `CREATE TABLE IF NOT EXISTS "${type.discriminator}" (${columns}, PRIMARY KEY (timestamp))`;
  }

  static query<T extends QueryObjectType<K>, K extends QueryObject>(
    type: T,
    query: Query<InferQueryObject<T>>
  ) {
    const columns = `${Object.entries(type.type)
      .map(([name]) => `${name}`)
      .join(', ')}`;

    let sql = `SELECT ${columns} FROM "${type.discriminator}"`;

    if (query.where) {
      const where = Array.of<string>();

      for (const columnName of Object.keys(query.where)) {
        const constraint = query.where[columnName];
        if (!constraint) {
          continue;
        }

        where.push(
          SQLiteLanguage.getConstraint(columnName, type.type[columnName], constraint)
        );
      }

      sql = `${sql} WHERE ${where.join(' AND ')}`;
    }

    if (query.orderBy) {
      sql = `${sql} ORDER BY timestamp ${query.orderBy ?? 'ASC'}`;
    }

    if (query.limit) {
      sql = `${sql} LIMIT ${query.limit}`;
    }

    return sql;
  }

  static replace<T extends QueryObjectType<K>, K extends QueryObject>(type: T) {
    const columns = `${Object.entries(type.type)
      .map(([name]) => `${name}`)
      .join(', ')}`;

    return `REPLACE INTO "${type.discriminator}" (${columns}) VALUES(${Object.entries(
      type.type
    )
      .map(() => '?')
      .join(', ')})`;
  }
}
