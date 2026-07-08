import {db} from './connection';
import {CREATE_TABLES_SQL, SEED_TAGS_SQL} from './schema';

let isInitialized = false;

/**
 * op-sqlite's execute() runs a single SQL statement at a time, so a block
 * containing several `CREATE TABLE ...;` / `INSERT ...;` statements has to
 * be split up and executed one statement at a time.
 */
const executeStatements = async (sql: string): Promise<void> => {
  const statements = sql
    .split(';')
    .map(statement => statement.trim())
    .filter(statement => statement.length > 0);

  for (const statement of statements) {
    await db.execute(`${statement};`);
  }
};

export const initializeDatabase = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    // Execute schema creation
    await executeStatements(CREATE_TABLES_SQL);

    // Seed default tags
    await executeStatements(SEED_TAGS_SQL);

    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const resetDatabase = async (): Promise<void> => {
  try {
    const {DROP_TABLES_SQL} = require('./schema');
    await executeStatements(DROP_TABLES_SQL);
    await executeStatements(CREATE_TABLES_SQL);
    await executeStatements(SEED_TAGS_SQL);
    isInitialized = true;
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Database reset error:', error);
    throw error;
  }
};
