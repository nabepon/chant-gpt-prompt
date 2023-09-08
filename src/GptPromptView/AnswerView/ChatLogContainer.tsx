import React, { CSSProperties, useState } from "react";
import IconButton from "@mui/material/IconButton";
import ContentCopy from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

type Props = {
  copyText: string | null;
  style: CSSProperties;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
};
export const ChatLogContainer: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  copyText,
  style,
  isSelected,
  onClick,
  onDelete,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isActive = isSelected && copyText;
  const backgroundColor = isActive
    ? "#f0f8ff"
    : style.backgroundColor ?? "transparent";
  const borderColor = isActive ? "#87cefa" : "transparent";

  const onMouseDown = (event: React.MouseEvent) => {
    setIsMouseDown(true);
    setPosition({ x: event.pageX, y: event.pageY });
  };
  const onMouseMove = (event: React.MouseEvent) => {
    const x = Math.abs(position.x - event.pageX) < 5;
    const y = Math.abs(position.y - event.pageY) < 5;
    if (isMouseDown && (!x || !y)) {
      setIsMouseDown(false);
    }
  };
  const onMouseUp = () => isMouseDown && onClick();

  return (
    <div
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{ ...style, backgroundColor, border: `1px solid ${borderColor}` }}
    >
      {children}
      {isActive && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ display: "flex", position: "fixed", top: "57px" }}>
            <Box>
              <IconButton
                style={{ background: "rgba(255, 255, 255, 1)" }}
                onMouseUp={() => navigator.clipboard.writeText(copyText)}
              >
                <ContentCopy />
              </IconButton>
            </Box>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <Box>
              <IconButton
                style={{ background: "rgba(255, 255, 255, 1)" }}
                onMouseUp={onDelete}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          </div>
        </div>
      )}
    </div>
  );
};
