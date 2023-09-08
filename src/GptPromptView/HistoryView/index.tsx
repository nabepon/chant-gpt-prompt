import React, { useEffect } from "react";
import {
  defaultHistoryState,
  History,
  HistoryState,
  useHistoryState,
} from "../useHistoryState";
import Box from "@mui/material/Box";
import { StatusIconButton } from "../StatusIconButton";
import produce from "immer";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";
import RestoreIcon from "@mui/icons-material/Restore";
import { usePromptState } from "../usePromptState";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import NativeSelect from "@mui/material/NativeSelect";
import Divider from "@mui/material/Divider";
import { Spacer } from "../../utils/Spacer";

export const HistoryView: React.FC = () => {
  const { historyState, setHistoryState, updateStatus } = useHistoryState();

  const { state, setState } = usePromptState();
  useEffect(() => {
    chrome.storage.local
      .get({ historyRecord: defaultHistoryState.historyRecord })
      .then(({ historyRecord }) => {
        const histories = (
          historyRecord as HistoryState["historyRecord"]
        ).histories.sort((a, b) => {
          const aTime = a.updatedAt || 0;
          const bTime = b.updatedAt || 0;
          if (aTime < bTime) return -1;
          if (aTime > bTime) return 1;
          if (a.id < b.id) return 1;
          if (a.id > b.id) return -1;
          return 0;
        });
        setHistoryState((state) => ({
          ...state,
          historyRecord: { ...historyRecord, histories },
          isLoading: false,
        }));
      });
  }, []);
  const onClickStatus = (history: History) => {
    updateStatus(history, state.model);
    if (state.id === history.id) {
      setState((state) => {
        return {
          ...state,
          status:
            history.status === "none"
              ? "pinned"
              : history.status === "pinned"
              ? "archived"
              : "none",
          updatedAt: Date.now(),
        };
      });
    }
  };
  const onClickDelete = (history: History) => {
    setHistoryState((historyState) => {
      const historyRecord = historyState.historyRecord;
      const newHistoryRecord = produce(historyRecord, (_historyRecord) => {
        if (!_historyRecord) return;
        _historyRecord.histories = _historyRecord.histories.filter(
          ({ id }) => id !== history.id
        );
      });
      chrome.storage.local
        .set({ historyRecord: newHistoryRecord })
        .catch(console.error);
      return { ...historyState, historyRecord: newHistoryRecord };
    });
  };
  const onClickRestore = (history: History) => {
    setState((state) => ({
      ...state,
      ...history,
      model: history.model,
      answer: "",
      additionalChat: "",
      selectedChatIndex: null,
      isShowCopy: false,
      tab: "answer",
    }));
  };
  const filteredHistories = (() => {
    if (
      !historyState.historyRecord ||
      !historyState.historyRecord?.histories.length
    ) {
      return [];
    }
    let histories = [...historyState.historyRecord.histories].reverse();
    if (!historyState.filterSetting) {
      return histories;
    }
    return histories.filter(
      (history) => history.status === historyState.filterSetting
    );
  })();

  if (historyState.isLoading) {
    return <Box sx={{ padding: "20px" }}>loading...</Box>;
  }

  return (
    <Box>
      <Box sx={{ margin: "4px 0 0 16px" }}>
        <FormControl>
          <InputLabel variant="standard">status</InputLabel>
          <NativeSelect
            value={historyState.filterSetting}
            onChange={(event) =>
              setHistoryState((state) => ({
                ...state,
                filterSetting: event.target.value,
              }))
            }
          >
            <option value=""></option>
            <option value="none">none</option>
            <option value="pinned">bookmarked</option>
            <option value="archived">archived</option>
          </NativeSelect>
        </FormControl>
      </Box>
      <Spacer />
      <Divider />
      {!filteredHistories.length && (
        <Box sx={{ padding: "20px" }}>not exist</Box>
      )}
      <Box sx={{ overflowY: "scroll", maxHeight: "400px" }}>
        <Box component="ul" sx={{ padding: "0 12px" }}>
          {filteredHistories.map((history) => {
            const mergedLog: any = history.chatLogs
              .map((chat) => chat.content)
              .join("");
            let result = "";
            const length = 75;
            if (mergedLog.length < length * 2) {
              result = mergedLog;
            } else {
              result = `${mergedLog.slice(0, length)} … ${mergedLog.slice(
                -length
              )}`;
            }

            return (
              <Box
                component="li"
                sx={{
                  display: "flex",
                  padding: "8px 0",
                  borderBottom: "1px solid #dcdcdc",
                }}
                key={history.id}
              >
                <Box>
                  <StatusIconButton
                    status={history.status}
                    onClick={() => onClickStatus(history)}
                  />
                </Box>
                <Box>
                  <IconButton>
                    <RestoreIcon onClick={() => onClickRestore(history)} />
                  </IconButton>
                </Box>
                <Box sx={{ flexGrow: 1 }}>{result}</Box>
                <Box>
                  <IconButton>
                    <DeleteOutlineIcon onClick={() => onClickDelete(history)} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};
