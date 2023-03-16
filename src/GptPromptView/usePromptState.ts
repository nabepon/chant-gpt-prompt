import {atom, useRecoilState, RecoilState} from "recoil";
import React, {useRef} from "react";
import {defaultOptionsState, OptionsState} from "../popup/Options/useOptionsState";
import {fetchCompletions} from "./fetchCompletions";
import produce from 'immer';

export type State = {
  tab: 'prompt' | 'answer';
  prompt: string;
  context: string;
  answer: string;
  additionalChat: string;
  chatLogs: {role: 'system' | 'user' | 'assistant', content: string}[];
  selectedChatIndex: number | null;
  promptOptions: OptionsState['promptOptions'];
  isLoading: boolean;
  isShowCopy: boolean;
  isMounted: boolean;
  mountError: Error | null;
  abortController: AbortController;
}
export const defaultState: State = {
  tab: 'prompt',
  prompt: '',
  context: '',
  answer: '',
  additionalChat: '',
  chatLogs: [],
  selectedChatIndex: null,
  promptOptions: [],
  isLoading: false,
  isShowCopy: false,
  isMounted: false,
  mountError: null,
  abortController: new AbortController(),
}
export const promptStateAtom = atom<State>({
  key: '@GPTPromptView',
  default: defaultState,
});

const useRecoilStateWithSession = <T>(recoilState: RecoilState<T>) => {
  const [state, setState] = useRecoilState(recoilState);
  const setStateWithSession = (updater: (state: T) => T) => {
    setState((state) => {
      const newState = updater(state);
      chrome.storage.session.set({ promptState: newState }).catch(() => {})
      return newState;
    });
  }
  return [state, setStateWithSession] as const;
}

export const usePromptState = () => {
  const [state, setState] = useRecoilStateWithSession(promptStateAtom);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    setTimeout(() => {
      if (!scrollContainerRef?.current) return;
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }, 20)
  }

  const onChangePrompt = (value: string) => {
    setState(state => ({...state, prompt: value}))
  }
  const onChangeContext = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(state => ({...state, context: event.target.value}))
  }
  const abort = () => {
    return state.abortController?.abort?.();
  };
  const stopAnswer = () => {
    abort();
    setState(state => produce(state, (_state) => {
      _state.isLoading = false;
      _state.chatLogs.push({role: 'assistant', content: state.answer})
      _state.answer = '\n\n-STOP-\n';
    }))
  }
  const onSubmit = async ({chatLogs}: { chatLogs: State['chatLogs'] }) => {
    const _chatLogs = chatLogs.filter(chat => chat.content);
    try {
      const abortController = new AbortController();
      setState(state => ({
        ...state,
        isLoading: true,
        tab: 'answer',
        additionalChat: '',
        answer: '',
        chatLogs: _chatLogs,
        abortController,
      }));
      scrollToBottom();
      const {options} = await chrome.storage.sync.get({options: defaultOptionsState}) || '';
      let isStart = false;
      await fetchCompletions({
        apiKey: options.apiSecretKey,
        messages: _chatLogs,
        abortController,
        onMessage: (result) => {
          if (!isStart && result.lines.length) {
            isStart = true;
            scrollToBottom();
          }
          console.log(result.content);
          setState(state => ({...state, answer: result.content}))
        },
      });
      setState(state => produce(state, (_state) => {
        _state.isLoading = false;
        _state.chatLogs.push({role: 'assistant', content: state.answer})
        _state.answer = '';
      }));
      scrollToBottom();
    } catch(e) {
      const error = e as Error;
      if (error.name === 'AbortError') {
        return;
      }
      setState(state => ({
        ...state,
        answer: error.message,
        isLoading: false,
      }));
      scrollToBottom();
    }
  }
  const onChangeAdditionalChat = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(state => ({...state, additionalChat: event.target.value}))
  }

  return {
    state,
    setState,
    onSubmit,
    onChangePrompt,
    onChangeContext,
    abort,
    stopAnswer,
    onChangeAdditionalChat,
    scrollContainerRef,
  }
}