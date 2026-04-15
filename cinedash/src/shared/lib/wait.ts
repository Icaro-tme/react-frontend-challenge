export function wait(tempoMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, tempoMs)
  })
}
