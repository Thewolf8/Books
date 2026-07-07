import {db} from './connection';
import {CREATE_TABLES_SQL, SEED_TAGS_SQL} from './schema';

let isInitialized = false;

export const initializeDatabase = async (): Promise<void> => {
  if (isInitialized) return;

  try {
    // Execute schema creation
    db.execute(CREATE_TABLES_SQL);

    // Seed default tags
    db.execute(SEED_TAGS_SQL);

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
    db.execute(DROP_TABLES_SQL);
    db.execute(CREATE_TABLES_SQL);
    db.execute(SEED_TAGS_SQL);
    console.log('Database reset successfully');
  } catch (error) {
    console.error('Database reset error:', error);
    throw error;
  }
};
