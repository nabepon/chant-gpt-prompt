import React from "react";

export const Spacer: React.FC<{ height?: number }> = (props) => {
  return <div style={{ width: "100%", height: `${props.height ?? 12}px` }} />;
};
