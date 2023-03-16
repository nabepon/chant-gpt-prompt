import {addIconEvent} from "./addIconEvent";
import {defaultOptionsState, OptionsState} from "../popup/Options/useOptionsState";

const main = async () => {
  chrome.storage.sync.get({options: defaultOptionsState}).then(( {options: _options}) => {
    const options = _options as OptionsState;
    if(!options.apiSecretKey || !options.enableTextSelectionIcon) return;
    addIconEvent();
  })
}
window.addEventListener('load', main, false);
