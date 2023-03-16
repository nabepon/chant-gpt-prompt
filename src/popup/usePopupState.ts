import {atom, useRecoilState} from "recoil";

type State = {
  isMounted: boolean;
  mountError: Error | null;
  tab: 'promptClient' | 'editPrompt' | 'history' | 'donate' | 'options'
}
export const defaultState: State = {
  isMounted: false,
  mountError: null,
  tab: 'promptClient',
}
export const optionsStateAtom = atom<State>({
  key: '@GPTPopupView',
  default: defaultState,
});

export const usePopupState = () => {
  const [state, setState] = useRecoilState(optionsStateAtom);

  return {
    state,
    setState,
    tab: state.tab,
    setTab: (tab: State['tab']) => setState(state => ({...state, tab}))
  }
}