import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const vesselInput = z
  .object({
    name: z.string().describe('Name').nullable().optional(),
    imo: z.string().describe('IMO').nullable().optional(),
    mmsi: z.string().describe('MMSI').nullable().optional(),
  })
  .nullable()
  .optional();

const portInput = z
  .object({
    name: z.string().describe('Port name').nullable().optional(),
    country: z.string().describe('Country').nullable().optional(),
  })
  .nullable()
  .optional();

const searchAreaId = async (area: string) => {
  return area;
};

const searchVessel = async (vessel: z.infer<typeof vesselInput>) => {
  if (!vessel) return '';
  return vessel.imo || vessel.mmsi || vessel.name;
};

const searchPort = async (port: z.infer<typeof portInput>) => {
  if (!port) return '';
  return port.name || port.country;
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
        flags: z.array(z.string()).describe('Flags').nullable().optional(),
        vessel_types: z
          .array(z.string())
          .describe('Vessel types')
          .nullable()
          .optional(),
        gear_types: z
          .array(z.string())
          .describe('Geartypes')
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
    vessel: vesselInput,
    port: portInput,
  }),
  outputSchema: z.object({
    url: z.string(),
  }),
  execute: async ({ context }) => {
    const {
      start_date,
      end_date,
      area,
      area_type,
      buffer,
      dataset,
      filters,
      vessel,
      port,
    } = context;
    if (vessel) {
      const vesselId = await searchVessel(vessel);
      return {
        url: `https://fishing-map.globalfishingwatch.org/map/vessel/${vesselId}?start=${start_date}&end=${end_date}`,
      };
    }
    if (port) {
      const portId = await searchPort(port);
      return {
        url: `https://fishing-map.globalfishingwatch.org/map/fishing-activity/default-public/ports-report/${portId}?start=${start_date}&end=${end_date}`,
      };
    }
    if (area) {
      const areaId = await searchAreaId(area);
      return {
        url: `https://fishing-map.globalfishingwatch.org/map/fishing-activity/default-public/report/public-eez-areas/${areaId}?start=${start_date}&end=${end_date}&dvIn[0][id]=vms&dvIn[0][cfg][vis]=false&dvIn[1][id]=context-layer-eez&dvIn[1][cfg][vis]=true&bDV&reportLoadVessels=true`,
      };
    }
    return { url: '' };
  },
});
