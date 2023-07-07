import {defaultState} from "./usePromptState";

export const fetchModels = async (apiKey: string): Promise<string[]> => {
  if (!apiKey) {
    return defaultState.models;
  }
  try {
    const result = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        authorization: `Bearer ${apiKey}`,
      },
    }).then(response => response.json());
    const models = (result.data as any[]).flatMap(item => item.id.startsWith('gpt') && !item.id.match(/\d{4}$/) ? [item.id] : [])
    return models.sort((a, b) => {
      if (a === 'gpt-3.5-turbo') return -1;
      if (b === 'gpt-3.5-turbo') return 1;
      return a > b ? 1 : -1
    });
  } catch(err) {
    console.error(err)
    return defaultState.models;
  }
}