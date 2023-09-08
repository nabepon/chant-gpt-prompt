import { atom, useRecoilState } from "recoil";
import { OptionsState } from "../Options/useOptionsState";

type State = {
  promptOptions: OptionsState["promptOptions"];
  newPrompt: string;
};
export const defaultState: State = {
  promptOptions: [],
  newPrompt: "",
};
export const optionsStateAtom = atom<State>({
  key: "@GPTEditPromptView",
  default: defaultState,
});

export const useEditPromptState = () => {
  const [state, setState] = useRecoilState(optionsStateAtom);

  return {
    state,
    setState,
  };
};
