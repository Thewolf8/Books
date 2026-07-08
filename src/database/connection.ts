import {open} from '@op-engineering/op-sqlite';

const DB_NAME = 'readling_library.db';

export const db = open({name: DB_NAME});

export const executeQuery = (sql: string, params?: any[]) => {
  return db.execute(sql, params);
};

export const executeTransaction = (queries: {sql: string; params?: any[]}[]) => {
  return db.transaction(async tx => {
    for (const query of queries) {
      await tx.execute(query.sql, query.params);
    }
  });
};
