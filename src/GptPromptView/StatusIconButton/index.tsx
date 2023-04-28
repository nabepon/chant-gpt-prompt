import React from "react";
import IconButton from "@mui/material/IconButton";
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import InventoryIcon from '@mui/icons-material/Inventory';

export const StatusIconButton: React.FC<{ status: string; onClick: () => void; }> = (props) => {
  return (
    <IconButton onClick={props.onClick}>
      {props.status === 'none' && <BookmarkBorderIcon />}
      {props.status === 'pinned' && <TurnedInIcon />}
      {props.status === 'archived' && <InventoryIcon />}
    </IconButton>
  )
}