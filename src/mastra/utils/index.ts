import { createLogger } from '@mastra/core/logger';
import { LibSQLStore } from '@mastra/libsql';
import { Memory } from '@mastra/memory';

export const logger = createLogger({
  name: 'Mastra',
  level: 'debug',
});

export const storage = new LibSQLStore({
  url: 'file:../mastra.db', // path is relative to the .mastra/output directory
});

export const memory = new Memory({
  storage: storage,
  options: {
    lastMessages: 10,
    semanticRecall: false,
    threads: {
      generateTitle: false,
    },
  },
});
