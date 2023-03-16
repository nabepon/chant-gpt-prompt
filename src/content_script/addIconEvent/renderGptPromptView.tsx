import createCache from "@emotion/cache";
import * as ReactDOMClient from "react-dom/client";
import {wait} from "../../utils/wait";
import React from "react";
import {CacheProvider} from "@emotion/react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {RecoilRoot} from "recoil";
import {GptPromptViewForContentScript} from "../../GptPromptView";

export const renderGptPromptView = async (container: HTMLElement, position: {x: number; y: number}, content: string) => {
  const shadowElement = document.createElement('div');
  const shadowRoot = shadowElement.attachShadow({mode: 'open'});

  // append viewContainer to shadowRoot
  const viewContainer = document.createElement('div');
  shadowRoot.appendChild(viewContainer)
  viewContainer.style.position = 'absolute';
  viewContainer.style.top = `${position.y}px`;
  viewContainer.style.left = `${position.x}px`;
  viewContainer.style.height = `0px`;
  viewContainer.style.width = `0px`;

  // append emotionContainer to shadowRoot
  const emotionContainer = document.createElement('style');
  emotionContainer.id = 'chant-gpt-prompt-css-style'
  shadowRoot.appendChild(emotionContainer);
  const cache = createCache({key: 'chant-gpt-prompt-css', prepend: true, container: emotionContainer})

  const root = ReactDOMClient.createRoot(viewContainer);
  const removeView = () => {
    root.unmount();
    shadowElement.parentNode?.removeChild(shadowElement);
  }

  await wait(30);

  root.render(
    <React.StrictMode>
      <CacheProvider value={cache}>
        <ThemeProvider theme={createTheme({typography: { fontSize: 12 }})}>
          <RecoilRoot>
            <GptPromptViewForContentScript content={content} removeView={removeView}/>
          </RecoilRoot>
        </ThemeProvider>
      </CacheProvider>
    </React.StrictMode>
  );

  container.appendChild(shadowElement);
}