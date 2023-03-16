import React, {useState} from "react";
import {usePromptState} from "./usePromptState";
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

export const GptPromptViewForContentScript: React.FC<{content: string; removeView: () => void}> = (props) => {
  const {state, setState} = usePromptState();
  const [isExpand, setIsExpand] = useState(true);

  useMount(props.content);

  const toggleExpand = () => setIsExpand(state => !state)
  const onClickPromptTab = () => {
    setIsExpand(true);
    setState(state => ({...state, tab: 'prompt'}));
  }
  const onClickAnswerTab = () => {
    setIsExpand(true);
    setState(state => ({...state, tab: 'answer'}));
  }

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
            <Button size="small" onClick={onClickPromptTab} variant={state.tab === 'prompt' ? 'outlined' : 'text'}>
              Prompt
            </Button>
            <Button size="small" onClick={onClickAnswerTab} variant={state.tab === 'answer' ? 'outlined' : 'text'}>
              Chat
            </Button>
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
            </>
          )}
        </Card>
      </div>
    </Draggable>
  )
}

export const GptPromptViewForPopup: React.FC = () => {
  const {state, setState} = usePromptState();

  useMount(state.context);

  const onClickPromptTab = () => setState(state => ({...state, tab: 'prompt'}))
  const onClickAnswerTab = () => setState(state => ({...state, tab: 'answer'}))

  if(!state.isMounted) {
    return <div style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>loading...</div>
  }
  if (state.mountError) {
    return null;
  }

  return (
    <Card>
      <Box className="handle" sx={{ display: 'flex', paddingLeft: '4px' }}>
        <Button size="small" onClick={onClickPromptTab} variant={state.tab === 'prompt' ? 'outlined' : 'text'}>
          Prompt
        </Button>
        <Button size="small" onClick={onClickAnswerTab} variant={state.tab === 'answer' ? 'outlined' : 'text'}>
          Chat
        </Button>
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
    </Card>
  )
}
