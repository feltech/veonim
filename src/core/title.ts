import { action, onStateChange, current } from '../core/neovim'
import * as canvasContainer from '../core/canvas-container'
import { merge, simplifyPath } from '../support/utils'

const height = 22
const titleBar = document.getElementById('title-bar') as HTMLElement
const title = document.querySelector('#title-bar > div') as HTMLElement

merge(titleBar.style, {
  height: `${height}px`,
  color: 'var(--foreground-40)',
  background: 'var(--background-15)',
})

onStateChange.file((file: string) => {
  const path = simplifyPath(file, current.cwd)
  title.innerText = `${path} - veonim`
})

action('titlebar', () => {
  const hidden = titleBar.style.display === 'none'
  titleBar.style.display = hidden ? 'flex' : 'none'
  canvasContainer.resize()
})

export const specs = {
  get height() { return titleBar.style.display === 'none' ? 0 : height }
}
