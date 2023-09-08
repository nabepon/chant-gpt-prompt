import Turndown from "turndown";

export type SelectedContent = { text: string; range: Range | null };

export const getSelectedContent = (): SelectedContent => {
  if (!window.getSelection()?.toString()) return { text: "", range: null };
  const range = window.getSelection()?.getRangeAt(0);
  if (!range) return { text: "", range: null };
  const content = range.cloneContents();
  const container = document.createElement("div");
  Array.from(content.childNodes).forEach((item) => container.appendChild(item));
  const turndown = new Turndown();
  const markdown = turndown.turndown(container.outerHTML);
  const str = markdown || window.getSelection()?.toString() || "";
  const text = str.replace(/^\n/, "");
  return { text, range };
};
