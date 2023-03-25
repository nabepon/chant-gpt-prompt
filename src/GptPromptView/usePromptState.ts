import {atom, useRecoilState, RecoilState} from "recoil";
import React, {useRef} from "react";
import {defaultOptionsState, OptionsState} from "../popup/Options/useOptionsState";
import {fetchCompletions} from "./fetchCompletions";
import produce from 'immer';
import AccessLevel = chrome.storage.AccessLevel;
import {defaultHistoryState, History, HistoryState} from "./useHistoryState";

export type ChatLog = {role: 'system' | 'user' | 'assistant', content: string};
export type Status = 'none' | 'pinned' | 'archived';

export type State = {
  id: string | null;
  tab: 'prompt' | 'answer' | 'history';
  prompt: string;
  context: string;
  answer: string;
  additionalChat: string;
  chatLogs: ChatLog[];
  selectedChatIndex: number | null;
  promptOptions: OptionsState['promptOptions'];
  isLoading: boolean;
  isShowCopy: boolean;
  isMounted: boolean;
  mountError: Error | null;
  abortController: AbortController;
  status: Status;
  updatedAt: number;
}
export const defaultState: State = {
  id: null,
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
  status: 'none',
  updatedAt: 0,
}
export const promptStateAtom = atom<State>({
  key: '@GPTPromptView',
  default: defaultState,
});

const useRecoilStateWithStorage = <T extends State>(recoilState: RecoilState<T>) => {
  const [state, setState] = useRecoilState(recoilState);
  const setStateWithSession = (updater: (state: T) => T) => {
    setState((state) => {
      const newState = updater(state);
      if (!newState.id) {
        return newState;
      }
      if(!newState.chatLogs.length) {
        return newState;
      }

      // TODO contentかpopupか見分けるためだけに使ってるので修正する
      chrome.storage.session.setAccessLevel({ accessLevel: AccessLevel.TRUSTED_CONTEXTS })
        .then(() => true)
        .catch(() => false)
        .then(async (isPopup) => {
          if(!newState.id) throw new Error('notfound id');
          const {historyRecord} = await chrome.storage.local.get({ historyRecord: defaultHistoryState.historyRecord });
          const histories = historyRecord?.histories as HistoryState['historyRecord']['histories'];
          const history = histories.find(history => history.id === newState.id);
          const newHistory: History = {
            id: newState.id,
            chatLogs: newState.chatLogs,
            status: newState.status,
            createdAt: Date.now(),
            updatedAt: newState.updatedAt,
          }
          if (!history) {
            histories.push(newHistory)
          } else {
            Object.assign(history, newHistory);
          }
          // TODO 期限切れで消す処理, modifiedStatusAtを作る
          await chrome.storage.local.set({
            historyRecord: {...historyRecord, histories},
            ...(isPopup ? { promptState: newState } : {})
          });
        })
      return newState;
    });
  }
  return [state, setStateWithSession] as const;
}

export const usePromptState = () => {
  const [state, setState] = useRecoilStateWithStorage(promptStateAtom);
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
  const onSubmit = async ({chatLogs, id}: { chatLogs: State['chatLogs'], id: string | null }) => {
    const _chatLogs = chatLogs.filter(chat => chat.content);
    try {
      const abortController = new AbortController();
      setState(state => ({
        ...state,
        id,
        isLoading: true,
        tab: 'answer',
        additionalChat: '',
        answer: '',
        chatLogs: _chatLogs,
        abortController,
        updatedAt: Date.now(),
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