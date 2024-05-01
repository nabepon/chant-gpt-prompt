import { defaultState } from "./usePromptState";

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
    }).then((response) => response.json());
    return (result.data as any[]).sort((a, b) => {
      if(defaultState.models.includes(a.id) && defaultState.models.includes(b.id)) {
        return a.created > b.created ? -1 : 1;
      }
      if(defaultState.models.includes(a.id)) {
        return -1;
      }
      if(defaultState.models.includes(b.id)) {
        return 1;
      }
      return a.created > b.created ? -1 : 1;
    }).flatMap((item) =>
      item.id.startsWith("gpt") && !item.id.match(/instruct/) && !item.id.match(/vision/) ? [item.id] : []
    );
  } catch (err) {
    console.error(err);
    return defaultState.models;
  }
};
