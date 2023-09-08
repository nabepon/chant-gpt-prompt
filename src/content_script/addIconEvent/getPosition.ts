export const keepPosition = () => {
  const position = { x: 0, y: 0 };
  const memoPosition = (event: MouseEvent) => {
    position.x = event.pageX;
    position.y = event.pageY;
  };
  document.addEventListener("mousedown", memoPosition);
  document.addEventListener("mousemove", memoPosition);
  document.addEventListener("mouseup", memoPosition);

  return () => position;
};
