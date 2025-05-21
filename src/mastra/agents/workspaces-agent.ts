import { Agent } from '@mastra/core/agent';
import { getGoogleModel, getOllamaModel } from '../models';
import { memory } from '../utils';
import { workspaceUrlTool } from '../tools';

const instructions = `
  I need you to extract a json with some parameters from a user prompt, if the name mentioned is not a country, an ocean, or a sea use this value as vessel name.
  - start_date: use ISO format
  - end_date: use ISO format
  - area: translate it into english
  - area_type: choose one of the following options:
    - eez (exclusive economic zone)
    - rfmo (regional fisheries management organization)
    - other
  - buffer: true or false if the user mentions something like "around the area"
  - dataset: choose one of the following options or leave it empty:
     - fishing
     - presence
     - detections
      - VIIRS
      - SAR
    - environment:
      - sea_surface_temperature
      - chlorophyll
  - vessel: {
    - name
    - imo
    - mmsi
  }
  - filters: {
    - flag: ISO3 code
    - geartype: translate it into english longline / trawler
  }
  send the output to the workspaceUrlTool tool and return just the url from the output of the tool
`;

const agent = {
  instructions,
  tools: { workspaceUrlTool },
  memory,
};
export const workspacesAgent = new Agent({
  ...agent,
  name: 'GFW workspaces agent',
  model: getOllamaModel(),
  // model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
  // model: getGoogleModel(),
});

export const workspacesGoogleAgent = new Agent({
  ...agent,
  name: 'GFW workspaces google agent',
  model: getGoogleModel(),
});
