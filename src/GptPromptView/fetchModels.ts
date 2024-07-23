import { defaultState } from "./usePromptState";

export const fetchModels = async (apiKey: string): Promise<string[]> => {
  const staticConfig = await fetch('https://nabepon.github.io/Chant-GPT.config.json').then(res => res.json())
  const defaultModels = [staticConfig.defaultModel, ...defaultState.models]

  if (!apiKey) {
    return defaultModels;
  }
  try {
    const result = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        authorization: `Bearer ${apiKey}`,
      },
    }).then(res => res.json());

    return (result.data as any[]).sort((a, b) => {
      if(defaultModels.includes(a.id) && defaultModels.includes(b.id)) {
        return a.created > b.created ? -1 : 1;
      }
      if(defaultModels.includes(a.id)) {
        return -1;
      }
      if(defaultModels.includes(b.id)) {
        return 1;
      }
      return a.created > b.created ? -1 : 1;
    }).flatMap((item) =>
      item.id.startsWith("gpt") && !item.id.match(/instruct/) && !item.id.match(/vision/) ? [item.id] : []
    );
  } catch (err) {
    console.error(err);
    return defaultModels;
  }
};
