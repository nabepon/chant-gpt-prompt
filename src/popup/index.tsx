import React, { useEffect, useRef } from "react";
import * as ReactDOMClient from "react-dom/client";
import { usePopupState } from "./usePopupState";
import { RecoilRoot, useRecoilState } from "recoil";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { EditPrompt } from "./EditPrompt";
import { GptPromptViewForPopup } from "../GptPromptView";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Spacer } from "../utils/Spacer";
import { Options } from "./Options";
import { defaultOptionsState, OptionsState } from "./Options/useOptionsState";
import {
  defaultState,
  promptStateAtom,
  State as PromptState,
} from "../GptPromptView/usePromptState";

const Popup = () => {
  const { tab, setTab, state, setState } = usePopupState();
  const [, setPromptState] = useRecoilState(promptStateAtom);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;

    Promise.all([
      chrome.storage.local
        .get({ promptState: defaultState })
        .then(({ promptState }) => {
          const state = promptState as PromptState;
          if (state.isLoading && state.answer) {
            // TODO background で実行して止まらないようにしたい
            setPromptState({
              ...state,
              chatLogs: [
                ...state.chatLogs,
                { role: "assistant", content: state.answer },
              ],
              isLoading: false,
              answer: "",
            });
            return;
          }
          setPromptState(state);
        })
        .catch((_error) => {
          const error = _error as Error;
          setState((state) => ({ ...state, mountError: error }));
        }),
      chrome.storage.sync
        .get({ options: defaultOptionsState })
        .then(({ options: _options }) => {
          const options = _options as OptionsState;
          if (!options.apiSecretKey) {
            setTab("options");
          }
        })
        .catch(() => setTab("options")),
    ]).then(() => {
      setState((state) => ({ ...state, isMounted: true }));
    });
  }, []);

  if (state.mountError) {
    return (
      <div>
        <pre>Error: {state.mountError.message}</pre>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", width: "100%", minWidth: "784px" }}>
        <Tabs
          value={tab}
          onChange={(_, tab) => {
            if (tab === "donate") {
              alert("donate");
              return;
            }
            setTab(tab);
          }}
        >
          <Tab value="promptClient" label="client" />
          <Tab value="editPrompt" label="edit" />
          {/*<Tab value="history" label="history" />*/}
          {/*<Tab value="donate" label="donate" />*/}
          <Tab value="options" label="config" />
        </Tabs>
      </div>
      {!state.isMounted ? (
        <div style={{ width: "100%", minWidth: "784px", height: "522px" }}>
          <Spacer />
          <div>
            <pre>loading...</pre>
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", minWidth: "784px", height: "522px" }}>
          <Spacer />
          {tab === "promptClient" && <GptPromptViewForPopup />}
          {tab === "editPrompt" && <EditPrompt />}
          {/*{tab === 'history' && <div style={{padding: '24px'}}>In development.</div>}*/}
          {tab === "options" && <Options />}
        </div>
      )}
    </div>
  );
};

const element = document.getElementById("root");
if (element) {
  const root = ReactDOMClient.createRoot(element);
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={createTheme({ typography: { fontSize: 12 } })}>
        <RecoilRoot>
          <Popup />
        </RecoilRoot>
      </ThemeProvider>
    </React.StrictMode>
  );
}
