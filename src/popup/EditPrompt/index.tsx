import React, {useEffect, useState} from "react";
import {defaultOptionsState, OptionsState} from "../Options/useOptionsState";
import produce from "immer";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import {useEditPromptState} from "./useEditPromptState";

export const EditPrompt: React.FC = () => {
  const {state, setState} = useEditPromptState();
  const [options, setOptions] = useState({});
  const promptOptions = state.promptOptions;
  useEffect(() => {
    chrome.storage.sync.get({options: defaultOptionsState}).then(({options: _options}) => {
      const options = _options as OptionsState;
      setOptions(options);
      const promptOptions = options.promptOptions.sort((a,b) => a.updatedAt > b.updatedAt ? -1 : 1)
      setState(state => ({...state, promptOptions}))
    }).catch((error) => {
      console.error('Popup mount error:', error);
    });
  }, [])


  const onNewPrompt = async () => {
    setState(state => {
      if (!state.newPrompt) return state;
      const maxId = Math.max(0, ...promptOptions.map(item => item.id));
      const newState = {
        ...state,
        newPrompt: '',
        promptOptions: [
          {updatedAt: Date.now(), value: state.newPrompt, id: maxId + 1},
          ...promptOptions,
        ]
      }
      chrome.storage.sync.set({options: {...options, promptOptions: newState.promptOptions}});
      return newState;
    })
  }
  const onEditPrompt = async (id: number, value: string) => {
    setState(state => {
      const newState = produce(state, (_state) => {
        const item = _state.promptOptions.find(item => item.id === id);
        if(!item) return;
        item.value = value;
        item.updatedAt = Date.now();
      });
      chrome.storage.sync.set({options: {...options, promptOptions: newState.promptOptions}});
      return newState;
    })
  }
  const onDeletePrompt = async (id: number) => {
    setState(state => {
      const newState = {
        ...state,
        promptOptions: state.promptOptions.filter(item => item.id !== id)
      };
      chrome.storage.sync.set({options: {...options, promptOptions: newState.promptOptions}});
      return newState;
    })
  }

  return (
    <>
      <Box sx={{display: 'flex', marginBottom: '12px'}}>
        <TextField
          label="New Prompt"
          maxRows={3}
          multiline
          fullWidth
          value={state.newPrompt}
          onChange={(event) => setState(state => ({...state, newPrompt: event.target.value}))}
          onKeyDown={async (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              await onNewPrompt();
            }
          }}
        />
        <Button onClick={onNewPrompt}>add</Button>
      </Box>
      <Divider />
      {promptOptions.map(prompt => {
        return (
          <Box sx={{display: 'flex', marginTop: '12px'}} key={prompt.id}>
            <TextField
              maxRows={3}
              multiline
              fullWidth
              value={prompt.value}
              onChange={(event) => onEditPrompt(prompt.id, event.target.value)}
              InputProps={{sx: {padding: '14px'}}}
            />
            <Button onClick={() => onDeletePrompt(prompt.id)}>delete</Button>
          </Box>
        )
      })}
    </>
  );
};