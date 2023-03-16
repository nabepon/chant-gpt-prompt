import React, {useEffect} from "react";
import {Spacer} from "../../utils/Spacer";
import {defaultOptionsState, useOptionsState} from "./useOptionsState";
import {wait} from "../../utils/wait";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export const Options = () => {
  const {options, setOptions, state, setState} = useOptionsState();

  useEffect(() => {
    chrome.storage.sync.get(
      {options: defaultOptionsState},
      (items) => {
        setOptions(state => ({...state, ...items.options}));
      }
    );
  }, []);

  const saveOptions = () => {
    chrome.storage.sync.set(
      {options},
      async () => {
        setState(state => ({...state, status: 'Options saved.'}));
        await chrome.runtime.sendMessage({message: "updateOptions"});
        const id = await wait(1000);
        setState(state => ({...state, status: ''}));
        return () => clearTimeout(id);
      }
    );
  };

  return (
    <Box sx={{ padding: '24px' }}>
      <section>
        <h3>API Secret Key</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: 1.45 }}>
          <li>
            <span>Login to OpenAI </span>
            <a href="https://platform.openai.com/account/api-keys" target="_blank">API key page</a>
          </li>
          <li>Click "Create new secret key" button</li>
          <li>Enter the generated key below</li>
        </ul>
        <Spacer />
        <TextField
          label="API key"
          type="password"
          sx={{width: 360}}
          value={options.apiSecretKey}
          onChange={(event) => {
            setOptions(state => ({...state, apiSecretKey: event.target.value}));
          }}
        />
      </section>

      <Spacer />
      <section>
        <h3>Text selection icon</h3>
        <FormControlLabel
          control={
            <Switch
              checked={options.enableTextSelectionIcon}
              onChange={(_, value) => {
                setOptions(state => ({...state, enableTextSelectionIcon: value}));
              }}
            />
          }
          label={options.enableTextSelectionIcon ? 'enabled' : 'disabled'}
          labelPlacement="start"
        />
      </section>

      <Spacer height={32} />
      <section>
        <div style={{ display: 'flex', alignItems: 'center'}}>
          <div>
            <Button onClick={saveOptions} variant="contained">Save</Button>
          </div>
          <div style={{ marginLeft: '12px' }}>{state.status}</div>
        </div>
      </section>
    </Box>
  );
};