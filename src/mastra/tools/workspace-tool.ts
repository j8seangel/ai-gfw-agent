import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const searchAreaId = async (area: string) => {
  return area;
};

const vesselInput = z
  .object({
    name: z.string().describe('Name').nullable().optional(),
    imo: z.string().describe('IMO').nullable().optional(),
    mmsi: z.string().describe('MMSI').nullable().optional(),
  })
  .nullable()
  .optional();

const searchVessel = async (vessel: z.infer<typeof vesselInput>) => {
  if (!vessel) return '';
  return vessel.imo || vessel.mmsi || vessel.name;
};

export const workspaceUrlTool = createTool({
  id: 'get-workspace-url',
  description: 'Get the workspace url for a location',
  inputSchema: z.object({
    start_date: z.string().describe('Start date').nullable().optional(),
    end_date: z.string().describe('End date').nullable().optional(),
    area: z.string().describe('Area').nullable().optional(),
    area_type: z.string().describe('Area type').nullable().optional(),
    buffer: z.boolean().describe('Buffer').nullable().optional(),
    dataset: z.string().describe('Dataset').nullable().optional(),
    filters: z
      .object({
        flag: z.string().describe('Flag').nullable().optional(),
        geartype: z.string().describe('Geartype').nullable().optional(),
      })
      .nullable()
      .optional(),
    vessel: vesselInput,
  }),
  outputSchema: z.object({
    url: z.string(),
  }),
  execute: async ({ context }) => {
    if (context.area) {
      const areaId = await searchAreaId(context.area);
      return {
        url: `https://fishing-map.globalfishingwatch.org/map/fishing-activity/default-public/report/public-eez-areas/${areaId}?start=${context.start_date}&end=${context.end_date}&dvIn[0][id]=vms&dvIn[0][cfg][vis]=false&dvIn[1][id]=context-layer-eez&dvIn[1][cfg][vis]=true&bDV&reportLoadVessels=true`,
      };
    }
    if (context.vessel) {
      const vesselId = await searchVessel(context.vessel);
      return {
        url: `https://fishing-map.globalfishingwatch.org/map/vessel/${context.vessel.name}`,
      };
    }
    return { url: '' };
  },
});
