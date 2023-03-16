import React from "react";

export const enterSubmitHandler = (callback: () => Promise<void>) => async (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    await callback();
  }
}
