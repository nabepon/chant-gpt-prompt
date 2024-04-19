type Message = { role: string; content: string | void };
type Line = { delta: Message; finish_reason: string };
export type MessageResult = {
  role: string;
  content: string;
  finish_reason: string;
  lines: Line[];
};
export const fetchCompletions = async ({
  apiKey,
  messages,
  abortController,
  onMessage,
  model,
  models,
}: {
  apiKey: string;
  messages: Message[];
  abortController: AbortController;
  onMessage: (result: MessageResult, meta: any) => void;
  model: string | undefined;
  models: string[];
}) => {
  const config = {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: model || models[0],
      messages,
      stream: true,
    }),
    signal: abortController.signal,
  };

  return await fetch("https://api.openai.com/v1/chat/completions", config)
    .then(async (response) => {
      if (!response.ok) {
        const { error } = await response.json();
        return Promise.reject(error);
      }
      return response;
    })
    .then((response) => {
      if (!response?.body) return;
      const decoder = new TextDecoder();
      const reader = response.body.getReader();
      const result = {
        role: "",
        content: "",
        finish_reason: "",
        lines: [] as Line[],
        decoded: "",
      };
      let decoded = "";

      const processStream = ({
        done,
        value,
      }: ReadableStreamReadResult<Uint8Array>): any => {
        if (done) {
          return result;
        }

        const _decoded = decoder.decode(value, { stream: true });
        decoded = decoded + _decoded;
        let lines = [];

        try {
          lines = decoded.split("\n\n").flatMap((item) => {
            const line = item.trim().replace(/^data: /, "");
            if (!item || line === "[DONE]") return [];
            return JSON.parse(line).choices;
          });
        } catch (e) {
          console.error(e);
          return reader.read().then(processStream);
        }
        decoded = "";

        result.lines.push(...lines);

        lines.forEach((line) => {
          if (line?.delta?.role) {
            result.role = line.delta.role;
          }
          if (line?.delta?.content) {
            result.content = result.content + line.delta.content;
          }
          if (line?.finish_reason) {
            result.finish_reason = line.finish_reason;
          }
        });
        result.content = result.content.replace(/^\n\n/, "");

        onMessage(result, { response, lines });

        return reader.read().then(processStream);
      };
      return reader.read().then(processStream);
    });
};
