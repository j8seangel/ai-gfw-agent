import { Mastra } from '@mastra/core';
import { logger } from './utils';
import {
  workspacesAgent,
  workspacesGoogleAgent,
} from './agents/workspaces-agent';

// Create the Mastra instance
export const mastra = new Mastra({
  agents: {
    workspacesAgent,
    workspacesGoogleAgent,
  },
  logger,
});
