import { createOllama } from 'ollama-ai-provider';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';

const ollamaProvider = createOllama({
  baseURL: 'http://localhost:11434/api',
});

const models = {
  granite3: 'granite3.3',
  granite31: 'granite3.1-dense:2b-instruct-q5_K_M',
  gemma3Tool: 'PetrosStav/gemma3-tools:12b',
  gemma3: 'gemma3:1b',
  mistral: 'mistral',
  deepseek: 'deepseek-r1',
};
export type SupportedOllamaModels = keyof typeof models;

export const getOllamaModel = (modelName: SupportedOllamaModels = 'gemma3') => {
  return ollamaProvider.chat(models[modelName], {
    simulateStreaming: true,
  });
};

export const getGoogleModel = (modelName: string = 'gemini-2.0-flash') => {
  return google(`models/${modelName}`);
};

export const getGroqModel = (
  modelName: string = 'meta-llama/llama-4-scout-17b-16e-instruct'
) => {
  return groq(modelName);
};
