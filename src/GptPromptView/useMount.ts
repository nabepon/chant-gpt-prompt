import {useEffect} from "react";
import {defaultOptionsState, OptionsState} from "../popup/Options/useOptionsState";
import {usePromptState} from "./usePromptState";

export const useMount = (context: string) => {
  const {setState} = usePromptState();

  useEffect(() => {
    chrome.storage.sync.get({options: defaultOptionsState}).then(( {options: _options}) => {
      const options = _options as OptionsState;
      const promptOptions = options.promptOptions.sort((a,b) => a.updatedAt > b.updatedAt ? -1 : 1)
      setState(state => ({
        ...state,
        context,
        promptOptions,
        isMounted: true,
        mountError: null,
      }))
      console.log('before mount: setState')
    }).catch((error) => {
      console.error('mount error:', error);
      setState(state => ({...state, mountError: error}))
    });
  }, [])
}
