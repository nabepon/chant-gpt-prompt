import React, {useState} from "react";
import {State, usePromptState} from "./usePromptState";
import {PromptView} from "./PromptView";
import {AnswerView} from "./AnswerView";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";
import {useMount} from "./useMount";
import Draggable from "react-draggable";
import Card from "@mui/material/Card";
import {StatusButton} from "./StatusButton";
import {HistoryView} from "./HistoryView";
import {useHistoryState} from "./useHistoryState";

export const GptPromptViewForContentScript: React.FC<{content: string; removeView: () => void}> = (props) => {
  const {state, setState} = usePromptState();
  const [isExpand, setIsExpand] = useState(true);
  const {historyState, updateStatus} = useHistoryState();

  useMount(props.content);

  const toggleExpand = () => setIsExpand(state => !state)
  const onClickTab = (tab: State['tab']) => () => {
    setIsExpand(true);
    setState(state => ({...state, tab}));
  };

  if(!state.isMounted) {
    return <div style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>loading...</div>
  }
  if (state.mountError) {
    return null;
  }

  return (
    <Draggable handle=".handle">
      <div>
        <Card sx={{ minWidth: 256, width: 520, resize: 'horizontal' }}>
          <Box className="handle" sx={{ display: 'flex', paddingLeft: '4px' }} onDoubleClick={toggleExpand}>
            <Button size="small" onClick={onClickTab('prompt')} variant={state.tab === 'prompt' ? 'outlined' : 'text'}>
              Prompt
            </Button>
            <Button size="small" onClick={onClickTab('answer')} variant={state.tab === 'answer' ? 'outlined' : 'text'}>
              Chat
            </Button>
            <Button size="small" onClick={onClickTab('history')} variant={state.tab === 'history' ? 'outlined' : 'text'}>
              History
            </Button>
            {state.id && (
              <StatusButton
                status={state.status}
                onClick={() => {
                  const status = state.status === 'none' ? 'pinned' : state.status === 'pinned' ? 'archived' : 'none';
                  setState(state => ({...state, status}));
                  const history = historyState.historyRecord.histories.find(history => history.id === state.id);
                  if (!history) return;
                  updateStatus(history);
                }}
              />
            )}
            <IconButton onClick={toggleExpand}>
              <ArrowDropDown />
            </IconButton>
            <Box sx={{ flexGrow: 1, justifyContent: 'end', display: 'flex' }}>
              <IconButton onClick={props.removeView}>
                <Close />
              </IconButton>
            </Box>
          </Box>
          {isExpand && (
            <>
              <Divider />
              {state.tab === 'prompt' && (
                <CardContent sx={{ paddingBottom: '0!important' }}>
                  <PromptView />
                </CardContent>
              )}
              {state.tab === 'answer' && (
                <CardContent sx={{padding: '0!important'}}>
                  <AnswerView />
                </CardContent>
              )}
              {state.tab === 'history' && (
                <CardContent sx={{padding: '0!important'}}>
                  <HistoryView />
                </CardContent>
              )}
            </>
          )}
        </Card>
      </div>
    </Draggable>
  )
}

export const GptPromptViewForPopup: React.FC = () => {
  const {state, setState} = usePromptState();
  const {historyState, updateStatus} = useHistoryState();

  useMount(state.context);

  const onClickTab = (tab: State['tab']) => () => {
    setState(state => ({...state, tab}));
  };

  if(!state.isMounted) {
    return <div style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>loading...</div>
  }
  if (state.mountError) {
    return null;
  }

  return (
    <Card>
      <Box className="handle" sx={{ display: 'flex', paddingLeft: '4px' }}>
        <Button size="small" onClick={onClickTab('prompt')} variant={state.tab === 'prompt' ? 'outlined' : 'text'}>
          Prompt
        </Button>
        <Button size="small" onClick={onClickTab('answer')} variant={state.tab === 'answer' ? 'outlined' : 'text'}>
          Chat
        </Button>
        <Button size="small" onClick={onClickTab('history')} variant={state.tab === 'history' ? 'outlined' : 'text'}>
          History
        </Button>
        {state.id && (
          <StatusButton
            status={state.status}
            onClick={() => {
              const status = state.status === 'none' ? 'pinned' : state.status === 'pinned' ? 'archived' : 'none';
              setState(state => ({...state, status}));
              const history = historyState.historyRecord.histories.find(history => history.id === state.id);
              if (!history) return;
              updateStatus(history);
            }}
          />
        )}
      </Box>
      <Divider />
      {state.tab === 'prompt' && (
        <CardContent sx={{ paddingBottom: '12px!important', maxHeight: '450px', minHeight: '450px' }}>
          <PromptView />
        </CardContent>
      )}
      {state.tab === 'answer' && (
        <CardContent sx={{padding: '0!important'}}>
          <AnswerView fixedHeight />
        </CardContent>
      )}
      {state.tab === 'history' && (
        <CardContent sx={{padding: '0!important'}}>
          <HistoryView />
        </CardContent>
      )}
    </Card>
  )
}
