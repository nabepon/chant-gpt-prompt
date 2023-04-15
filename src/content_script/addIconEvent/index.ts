import {wait} from "../../utils/wait";
import {getSelectedContent} from "./getSelectedContent";
import {renderGptPromptView} from "./renderGptPromptView";
import {keepPosition} from "./getPosition";
import {iconSvg} from "./iconSvg";
import {defaultOptionsState, OptionsState} from "../../popup/Options/useOptionsState";

const ICON_ID = 'chant-gpt-prompt-icon';
const CONTAINER_ID = 'chant-gpt-prompt-container';
let container: HTMLDivElement;
let position: ReturnType<typeof keepPosition>;
export const addPrevent = () => {
  /**
   * add container
   */
  container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.style.position = 'absolute';
  container.style.top = `0px`
  container.style.left = `0px`
  container.style.zIndex = '1000';
  document.body.parentNode?.appendChild(container);

  /**
   * keep position
   */
  position = keepPosition();
}

export const addIconEvent = () => {
  /**
   * add icon
   */
  const addIcon = async () => {
    try {
      await new Promise((resolve, reject) => {
        chrome.storage.sync.get({options: defaultOptionsState}).then(( {options: _options}) => {
          const options = _options as OptionsState;
          if (options.apiSecretKey && options.enableTextSelectionIcon) {
            resolve(undefined);
          } else {
            reject(undefined);
          }
        })
      })
    } catch(error) {
      return
    }

    await wait(100);
    const selectedContent = getSelectedContent();
    if(!selectedContent.text) return;

    const icon = document.querySelector(`#${ICON_ID}`);
    icon?.parentNode?.removeChild(icon);

    const element = document.createElement('div');
    element.id = ICON_ID;
    element.style.position = 'absolute';
    element.style.top = `${position().y - 20}px`
    element.style.left = `${position().x}px`
    element.style.width = '34px';
    element.style.height = '34px';
    element.innerHTML =  iconSvg;
    element.addEventListener('click', async () => {
      const icon = document.querySelector(`#${ICON_ID}`);
      icon?.parentNode?.removeChild(icon);
      await renderGptPromptView(container, position(), selectedContent.text);
      await wait(100);
      if(selectedContent.range) {
        document.getSelection()?.removeAllRanges();
        document.getSelection()?.addRange(selectedContent.range);
      }
    })
    container.appendChild(element)
  }
  const onSelectAll = async (event: KeyboardEvent) => {
    if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
      await addIcon();
    }
  }
  document.addEventListener('mouseup', addIcon);
  document.addEventListener('keydown', onSelectAll);


  /**
   * remove icon for outside
   */
  document.addEventListener('mousedown', (event) => {
    const target = event.target as HTMLElement;
    const findParentWithId = (element: HTMLElement | null, id: string): HTMLElement | null => {
      if (!element || !id) return null;
      if (element.id === id) return element;
      return findParentWithId(element.parentNode as HTMLElement, id);
    }
    if (findParentWithId(target, ICON_ID)) {
      return;
    }
    const icon = document.querySelector(`#${ICON_ID}`);
    icon?.parentNode?.removeChild(icon);
  });
}

export const addContextMenuAndCommand = () => {
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.command !== 'Chant-GPT_Prompt') {
      return
    }

    try {
      await new Promise((resolve, reject) => {
        chrome.storage.sync.get({options: defaultOptionsState}).then(( {options: _options}) => {
          const options = _options as OptionsState;
          if (options.apiSecretKey) {
            resolve(undefined);
          } else {
            reject(undefined);
          }
        })
      })
    } catch(error) {
      alert('you need to set a secret key');
      return
    }

    const selectedContent = getSelectedContent();
    await renderGptPromptView(container, position(), selectedContent?.text || '');
    await wait(100);
    if(selectedContent.range) {
      document.getSelection()?.removeAllRanges();
      document.getSelection()?.addRange(selectedContent.range);
    }
  });
}