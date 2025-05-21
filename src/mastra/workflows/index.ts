// // Define the activity planning step
// const generateReportUrl = createStep({
//   id: 'generate-report-url',
//   inputSchema: z.object({
//     areaId: z.string().describe('The id of the area of interest'),
//     startDate: z.string().describe('The start date of the report'),
//     endDate: z.string().describe('The end date of the report'),
//   }),
//   outputSchema: z.object({
//     url: z.string(),
//   }),
//   execute: async ({ inputData }) => {
//     mastra
//       .getLogger()
//       ?.debug(
//         `Generating report url for ${inputData.areaId} from ${inputData.startDate} to ${inputData.endDate}`
//       );
//     const url = `https://fishing-map.globalfishingwatch.org/map/fishing-activity/default-public/report/public-eez-areas/${inputData.areaId}?start=${inputData.startDate}&end=${inputData.endDate}&dvIn[0][id]=vms&dvIn[0][cfg][vis]=false&dvIn[1][id]=context-layer-eez&dvIn[1][cfg][vis]=true&bDV&reportLoadVessels=true`;
//     return {
//       url,
//     };
//   },
// });

// // Fetch all EEZs from the GFW API
// const getAllData = async () => {
//   const response = await fetch(
//     `https://gateway.api.dev.globalfishingwatch.org/v3/datasets/public-eez-areas/context-layers`,
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.GFW_API_KEY}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     throw new Error(
//       `Failed to fetch data from GFW API: ${response.statusText}`
//     );
//   }

//   const data = (await response.json()) as any[];
//   return data.map((item) => ({
//     id: item.id.toString(),
//     name: item.label,
//   }));
// };

// export const getAreasTool = createTool({
//   id: 'get-areas',
//   description:
//     'Returns a list of Exclusive Economic Zones (EEZs). Use this tool to find the correct EEZ id for a country before generating a workspace URL.',
//   // inputSchema: z.object({
//   //   area: z.string().describe('The name of the country to search EEZs for'),
//   // }),
//   outputSchema: z.array(z.object({ id: z.string(), name: z.string() })),
//   execute: async ({ context }) => {
//     const areas = await getAllData();
//     return areas;
//   },
// });
// const getAreaAgent = new Agent({
//   name: 'get-area-agent',
//   instructions: `When asked to get an area:
// 1. Use the get-areas tool to get the list of EEZs for all countries.
// 2. Select the correct EEZ from the list (matching the country name). Prioritize the main EEZ over the subareas, overlapping or joint regimes areas.
//     In case of multiple options prompt the user to select the correct one.
// 3. Once you have one selection return only the id of the selected EEZ with this format:
//     {
//       "areaId": "1234567890",
//       "startDate": "2025-05-22T00:00:00.000Z",
//       "endDate": "2025-05-22T00:00:00.000Z"
//     }
// `,
//   model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
//   tools: { getAreasTool },
// });

// const getAreaAgentStep = createStep(getAreaAgent);

// // Create the weather workflow
// const reportsWorkflow = createWorkflow({
//   id: 'reports-workflow',
//   inputSchema: z.object({
//     area: z.string().describe('The area of interest'),
//     startDate: z.string().describe('The start date of the report'),
//     endDate: z.string().describe('The end date of the report'),
//   }),
//   outputSchema: z.object({
//     url: z.string().describe('The url of the report'),
//   }),
//   steps: [getAreaAgentStep, generateReportUrl],
// })
//   .map(({ inputData }) => {
//     logger.debug('🚀 ~ .map ~ inputData:', inputData);
//     return {
//       prompt:
//         'get the area id with this name: ' +
//         inputData.area +
//         ' and for the start date: ' +
//         inputData.startDate +
//         ' and for the end date: ' +
//         inputData.endDate,
//     };
//   })
//   .then(getAreaAgentStep)
//   .map((context) => {
//     logger.debug('🚀 ~ .map ~ context:', context);
//     return JSON.parse(context.inputData.text);
//   })
//   .then(generateReportUrl)
//   .commit();

// // Create a tool that uses the workflow
// const reportTool = createTool({
//   id: 'get-report',
//   description: `
//     Generates a global fishing watch (GFW) report of fishing/presence/detections activity in Exclusive Economic Zones (EEZs), RFMOs, or other areas of interest for a given timerange.
//     Required inputs are: area and timerange.
//     If you don't have the area, ask the user for the area and
//     If you don't have the timerange, ask the user for the timerange.
//     Then continue with the workflow.
//   `,
//   inputSchema: z.object({
//     area: z.string().describe('The area of interest'),
//     startDate: z.string().describe('The start date of the report'),
//     endDate: z.string().describe('The end date of the report'),
//   }),
//   outputSchema: z.object({
//     url: z.string().describe('The url of the report'),
//   }),
//   execute: async ({ context: { area, startDate, endDate }, mastra }) => {
//     logger?.debug(`Tool executing for area: ${area}`);

//     const workflow = mastra?.vnext_getWorkflow('reportsWorkflow');
//     if (!workflow) {
//       throw new Error('Weather workflow not found');
//     }

//     if (!area || !startDate || !endDate) {
//       return 'Missing required inputs';
//     }

//     const run = workflow.createRun();
//     const result = await run.start({
//       inputData: {
//         area: area,
//         startDate: startDate,
//         endDate: endDate,
//       },
//     });

//     if (result.status === 'success') {
//       return {
//         url: result.result.url,
//       };
//     }

//     throw new Error(`Workflow execution failed: ${result.status}`);
//   },
// });

// const reportAgent = new Agent({
//   name: 'GFW reports agent',
//   // model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
//   // model: getOllamaModel(),
//   model: getGoogleModel(),
//   instructions: `
//   You are an agent that generates the url of a global fishing watch (GFW) report of fishing/presence/detections activity in Exclusive Economic Zones (EEZs), RFMOs, or other areas of interest for a given timerange.
//   Use the get-report tool to get the url of the report ensuring that the area and timerange are correct.
//   Be concise and to the point, using this format "click here to see this report" in markdown format.
//   Take into account the previous inputs.
//   If the tool returns 'Missing required inputs' ask the user for the area and timerange again.
//   `,
//   tools: { reportTool },
// });

// Create the Mastra instance
// export const mastra = new Mastra({
//   vnext_workflows: {
//     reportsWorkflow,
//   },
//   agents: {
//     reportAgent,
//     workspacesAgent,
//     workspacesGoogleAgent,
//   },
//   logger,
// });
