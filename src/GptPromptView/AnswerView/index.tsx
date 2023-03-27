import React from "react";
import Button from "@mui/material/Button";
import {Markdown} from "./Markdown";
import {usePromptState} from "../usePromptState";
import {ChatLogContainer} from "./ChatLogContainer";
import {enterSubmitHandler} from "../enterSubmitHandler";
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import SendIcon from '@mui/icons-material/Send';
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import CircularProgress from '@mui/material/CircularProgress';
import {createId} from "../useHistoryState";

export const AnswerView: React.FC<{ fixedHeight?: boolean }> = (props) => {
  const {state, setState, stopAnswer,  onChangeAdditionalChat, onSubmit, scrollContainerRef} = usePromptState();

  const submitHandler = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if(state.isLoading) return;
    if (!state.additionalChat) {
      await onSubmit({ chatLogs: state.chatLogs, id: state.id || createId()});
    } else {
      const chatLogs = [
        ...state.chatLogs,
        {role: 'user', content: state.additionalChat} as const,
      ];
      await onSubmit({chatLogs, id: state.id || createId()});
    }
  }

  return (
    <div style={{lineHeight: '1.45', fontSize: '85%'}}>
      <div ref={scrollContainerRef} style={{
        position: 'relative',
        maxHeight: '400px',
        minHeight: props.fixedHeight || state.isLoading ? '400px' : '0',
        overflowY: 'scroll',
      }}>
        {state.chatLogs.map((log, index) => {
          const backgroundColor = log.role === 'assistant' ? 'transparent' : 'rgb(247,247,248)';
          const isSelected = index === state.selectedChatIndex;
          return (
            <ChatLogContainer
              key={index}
              style={{backgroundColor, padding: '8px 16px'}}
              copyText={log.content}
              isSelected={isSelected}
              onClick={() => {
                setState(state => ({
                  ...state,
                  selectedChatIndex: isSelected ? null : index,
                }));
              }}
              onDelete={() => {
                setState(state => {
                  const chatLogs = state.chatLogs.flatMap((chat, _index) => {
                    return index === _index ? [] : [chat];
                  })
                  return ({...state, chatLogs, selectedChatIndex: null});
                });
              }}
            >
              <Markdown children={log.content} />
            </ChatLogContainer>
          )
        })}
        {state.answer && (
          <div style={{padding: '8px 16px'}}>
            <Markdown children={state.answer} />
          </div>
        )}
      </div>
      <Divider />
      <CardContent sx={{paddingBottom: '16px!important'}}>
        <form onSubmit={submitHandler} onKeyDown={enterSubmitHandler(submitHandler)}>
          <Paper
            sx={{
              p: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <InputBase
              fullWidth
              value={state.additionalChat}
              multiline
              minRows={1}
              maxRows={3}
              onChange={onChangeAdditionalChat}
            />
            {state.isLoading && (
              <Box sx={{height: 38, display: 'flex', alignItems: 'center'}}>
                <Button onClick={stopAnswer} size="small" variant="outlined" color="secondary" endIcon={<CircularProgress size={20} />}>
                  Stop
                </Button>
              </Box>
            ) || (
              <IconButton type="submit" color="secondary">
                <SendIcon />
              </IconButton>
            )}
          </Paper>
        </form>
      </CardContent>
    </div>
  )
}