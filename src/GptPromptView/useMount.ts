import { useEffect } from "react";
import {
  defaultOptionsState,
  OptionsState,
} from "../popup/Options/useOptionsState";
import { usePromptState } from "./usePromptState";
import { fetchModels } from "./fetchModels";

export const useMount = (context: string) => {
  const { setState } = usePromptState();

  useEffect(() => {
    (async () => {
      const { options } =
        (await chrome.storage.sync.get({ options: defaultOptionsState })) || "";
      const models = await fetchModels(options.apiSecretKey);
      setState((state) => ({ ...state, models }));
    })();
    chrome.storage.sync
      .get({ options: defaultOptionsState })
      .then(({ options: _options }) => {
        const options = _options as OptionsState;
        const promptOptions = options.promptOptions.sort((a, b) =>
          a.updatedAt > b.updatedAt ? -1 : 1
        );
        setState((state) => ({
          ...state,
          context,
          promptOptions,
          isMounted: true,
          mountError: null,
        }));
        console.log("before mount: setState");
      })
      .catch((error) => {
        console.error("mount error:", error);
        setState((state) => ({ ...state, mountError: error }));
      });
  }, []);
};
