import {ChatLog, State, Status} from "./usePromptState";
import {atom, useRecoilState} from "recoil";
import produce from "immer";

export const createId = () => Date.now() + Math.random().toString(32).substring(1);

export type History = {
  id: string;
  chatLogs: ChatLog[];
  status: Status;
  createdAt: number;
  updatedAt: number;
}

export type HistoryState = {
  filterSetting: string;
  isLoading: boolean;
  historyRecord: {
    histories: History[];
  }
}

export const defaultHistoryState: HistoryState = {
  filterSetting: '',
  isLoading: true,
  historyRecord: {
    histories: [],
  }
}

export const historyStateAtom = atom<HistoryState>({
  key: '@GPTHistory',
  default: defaultHistoryState,
});

export const useHistoryState = () => {
  const [state, setHistoryState] = useRecoilState(historyStateAtom);

  const updateStatus = (history: History) => {
    setHistoryState(historyState => {
      const historyRecord = historyState.historyRecord;
      const newHistoryRecord = produce(historyRecord, (_historyRecord) => {
        const target = _historyRecord?.histories.find(({id}) => id === history.id);
        if (!target) return;
        target.status = history.status === 'none' ? 'pinned' : history.status === 'pinned' ? 'archived' : 'none';
        target.updatedAt = Date.now();
      });
      chrome.storage.local.set({ historyRecord: newHistoryRecord }).catch(console.error);
      return {...historyState, historyRecord: newHistoryRecord}
    })
  }

  return {
    historyState: state,
    setHistoryState,
    updateStatus,
  }
}