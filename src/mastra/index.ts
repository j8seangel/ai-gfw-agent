import { Mastra } from '@mastra/core';
import { logger } from './utils';
import {
  workspacesAgent,
  workspacesGoogleAgent,
} from './agents/workspaces-agent';
import { LibSQLStore } from '@mastra/libsql';

// Create the Mastra instance
export const mastra = new Mastra({
  agents: {
    workspacesAgent,
    workspacesGoogleAgent,
  },
  logger,
  storage: new LibSQLStore({
    url: 'file:../mastra.db',
  }),
});
