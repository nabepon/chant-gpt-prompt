export const wait = async (time: number): Promise<number> => {
  return new Promise((resolve) => {
    const id = window.setTimeout(() => {
      resolve(id)
    }, time);
  })
}