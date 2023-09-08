import { atom, useRecoilState } from "recoil";

export type PromptOption = { id: number; value: string; updatedAt: number };
export type OptionsState = {
  apiSecretKey: string;
  promptOptions: PromptOption[];
  enableTextSelectionIcon: boolean;
  flipPromptAndContext: boolean;
};
export const defaultOptionsState: OptionsState = {
  apiSecretKey: "",
  promptOptions: [],
  enableTextSelectionIcon: false,
  flipPromptAndContext: false,
};
export const optionsStateAtom = atom<OptionsState>({
  key: "@GPTOptionsView/options",
  default: defaultOptionsState,
});

type State = {
  status: string;
};
export const stateAtom = atom<State>({
  key: "@GPTOptionsView/state",
  default: {
    status: "",
  },
});

export const useOptionsState = () => {
  const [options, setOptions] = useRecoilState(optionsStateAtom);
  const [state, setState] = useRecoilState(stateAtom);

  return {
    options,
    setOptions,
    state,
    setState,
  };
};
