import React, {useEffect, useState} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import {defaultOptionsState, OptionsState, PromptOption} from "../../popup/Options/useOptionsState";
import produce from "immer";
import {Spacer} from "../../utils/Spacer";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {usePromptState} from "../usePromptState";
import {enterSubmitHandler} from "../enterSubmitHandler";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import FormControl from "@mui/material/FormControl";
import NativeSelect from "@mui/material/NativeSelect";

const CustomInput = React.forwardRef((
  props: any,
  ref: React.ForwardedRef<HTMLDivElement>,
) => {
  return (
    <TextField
      label="Prompt"
      {...props.inputProps}
      ref={ref}
      fullWidth
      multiline
      inputProps={{
        ...props.inputProps,
        'data-lpignore': true,
      }}
      maxRows={3}
    />
  )
});

export const PromptView: React.FC = () => {
  const {state, onSubmit, onChangePrompt, onChangeContext, abort} = usePromptState();
  const [flip, setFlip] = useState<boolean>(false);
  const [model, setModel] = useState<string>();

  useEffect(() => {
    chrome.storage.sync.get(
      {options: defaultOptionsState},
      (items) => {
        setFlip(items.options.flipPromptAndContext);
      }
    );
  }, []);

  const submitHandler = async (event?: React.FormEvent) => {
    event?.preventDefault();
    abort();
    await onSubmit({
      chatLogs: flip ? [
        {role: "user", content: state.context},
        {role: "system", content: state.prompt},
      ] : [
        {role: "system", content: state.prompt},
        {role: "user", content: state.context},
      ],
      model,
    });
  }

  return (
    <form onSubmit={submitHandler} onKeyDown={enterSubmitHandler(submitHandler)}>
      {flip && (
        <>
          <TextField
            fullWidth
            value={state.context}
            label="Context"
            multiline
            minRows={5}
            maxRows={14}
            onChange={onChangeContext}
          />
          <Spacer />
        </>
      )}
      <Autocomplete
        key="Autocomplete"
        freeSolo
        componentsProps={{popper: {disablePortal: true}}}
        inputValue={state.prompt}
        defaultValue={{id: -1, value: state.prompt || ''}}
        options={[{id: -1, value: ''}, ...state.promptOptions]}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.id}>
            <pre style={{margin: '4px', minHeight: '1rem'}}>{option.value}</pre>
          </Box>
        )}
        getOptionLabel={option => {
          return typeof option === 'string' ? option : option.value;
        }}
        renderInput={(params) => (
          <Box ref={params.InputProps.ref}>
            {/* TextFieldを無理やり使っている */}
            <CustomInput {...params as any}/>
          </Box>
        )}
        onChange={async (event, _prompt ) => {
          const prompt = _prompt as PromptOption;
          const {options: _options} = await chrome.storage.sync.get({options: defaultOptionsState});
          const options = _options as OptionsState;
          const promptOptions = options.promptOptions.sort((a,b) => a.updatedAt > b.updatedAt ? -1 : 1)
          const newState = produce(promptOptions, (promptOptions) => {
            const item = promptOptions.find(item => item.id === prompt.id);
            if(!item) return;
            item.updatedAt = Date.now();
          });
          await chrome.storage.sync.set({options: {...options, promptOptions: newState}});
        }}
        onInputChange={(event, value) => {
          onChangePrompt(value)
        }}
      />
      {!flip && (
        <>
          <Spacer />
          <TextField
            fullWidth
            value={state.context}
            label="Context"
            multiline
            minRows={5}
            maxRows={14}
            onChange={onChangeContext}
          />
        </>
      )}

      <Box sx={{ padding: '4px 0', display: 'flex' }}>
        <FormControlLabel
          sx={{flexGrow: 1, justifyContent: 'flex-end'}}
          control={<Switch size="small" checked={flip} onChange={(_, value) => setFlip(value)} />}
          label={'flip prompt'}
          labelPlacement="start"
        />
        <FormControl size="small" sx={{display: 'flex', justifyContent: 'center'}}>
          <NativeSelect
            value={model}
            onChange={(event) => setModel(event.target.value)}
          >
            {state.models.map(model => <option>{model}</option>)}
          </NativeSelect>
        </FormControl>
        <Button size="small" type="submit">New Chat</Button>
      </Box>
    </form>
  )
}