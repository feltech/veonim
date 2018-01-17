import { setVar, paddingVH, paddingH, paddingV, contrast, darken, brighten } from '../ui/css'
import $, { watch } from '../core/state'
import { is } from '../support/utils'
import { style } from '../ui/uikit'

type WhateverObject = { [index: string]: any }
type StyleParams = WhateverObject & { activeWhen?: boolean }
type Content = any[] | string | number
type SC1 = (content: Content) => any
type SC2 = (params: StyleParams, content: Content) => any
type StyledComponent = SC1 & SC2

const refreshBackground = (bg = $.background) => {
  setVar('background-b10', brighten(bg, 10))
  setVar('background', bg)
  setVar('background-10', darken(bg, 10))
  setVar('background-15', darken(bg, 15))
  setVar('background-20', darken(bg, 20))
  setVar('background-30', darken(bg, 30))
  setVar('background-40', darken(bg, 40))
  setVar('background-45', darken(bg, 45))
  setVar('background-50', darken(bg, 50))

  setVar('foreground-b10', contrast(bg, -10))
  setVar('foreground', bg)
  setVar('foreground-10', contrast(bg, 10))
  setVar('foreground-15', contrast(bg, 15))
  setVar('foreground-20', contrast(bg, 20))
  setVar('foreground-30', contrast(bg, 30))
  setVar('foreground-40', contrast(bg, 40))
  setVar('foreground-45', contrast(bg, 45))
  setVar('foreground-50', contrast(bg, 50))
}

refreshBackground()
watch.background(bg => refreshBackground(bg))

const isContent = (thing: any) => is.array(thing) || is.string(thing) || is.number(thing)

export const modstyl = (states: object): StyledComponent => (...args: any[]) => {
  const params: StyleParams = args.find(a => is.object(a)) || {}
  const content: Content = args.find(isContent)

  if (params.activeWhen) {
    const styl = Reflect.get(states, 'active')
    if (is.function(style)) return styl(params, content)
    else throw new Error(`styled component defined 'activeWhen' property, however no 'active' state object was found`)
  }

  const styl = Reflect.get(states, 'normal')
  if (is.function(style)) return styl(params, content)
  else throw new Error(`styled component has no default 'active' state object`)
}

export const colors = {
  error: '#ef2f2f',
  warning: '#ffb100',
  success: '#72a940',
  system: '#28b0ff',
}

const badge = style('span')({
  ...paddingV(4),
  borderRadius: '2px',
  background: 'var(--background-30)'
})

export const Badge = (content: string | number, style = {}) => badge({ style }, content)

const pluginBase = {
  zIndex: 99,
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
}

const plugin = {
  default: style('div')({ ...pluginBase, alignItems: 'flex-start' }),
  top: style('div')({ ...pluginBase, alignItems: 'flex-start' }),
  bottom: style('div')({ ...pluginBase, alignItems: 'flex-end' }),
  right: style('div')({
    ...pluginBase,
    justifyContent: 'flex-end',
    alignItems: 'stretch'
  }),
}

const Dialog = style('div')({
  background: 'var(--background-40)',
  marginTop: '15%',
})

const dialogCreator = (size: number, content: Content, style = {} as any) =>
  Dialog({ style: { ...style, width: `${size}px` } }, content)

const pluginCreator = (id: string, visible: boolean, content: Content, type: string) =>
  Reflect.get(plugin, type)({ id, style: { display: visible ? 'flex' : 'none' }}, content)

export const Plugin = {
  default: (name: string, visible: boolean, content: Content) =>
    pluginCreator(name, visible, dialogCreator(600, content), 'default'),
  top: (name: string, visible: boolean, content: Content, style?: object) =>
    pluginCreator(name, visible, dialogCreator(400, content, style), 'top'),
  bottom: (name: string, visible: boolean, content: Content) =>
    pluginCreator(name, visible, content, 'bottom'),
  right: (name: string, visible: boolean, content: Content) =>
    pluginCreator(name, visible, Dialog({ style: {
      height: '100%',
      width: '500px',
      flexFlow: 'column',
      marginTop: '0px',
    }}, content), 'right'),
}

const rowLastPad = {
  ':last-child': {
    paddingBottom: '9px',
  },
}

const row = {
  ...paddingVH(12, 4),
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  color: '#aaa',
}

const activeRow = {
  ...row,
  color: '#fff',
  fontWeight: 'bold',
  background: 'rgba(255, 255, 255, 0.05)',
}

export const Row = {
  normal: modstyl({
    normal: style('div')(row),
    active: style('div')(activeRow)
  }),

  files: modstyl({
    normal: style('div')({ ...row, ...rowLastPad }),
    active: style('div')({ ...activeRow, ...rowLastPad }),
  }),

  complete: modstyl({
    normal: style('div')({
      ...row,
      ...paddingVH(8, 0),
      lineHeight: `var(--line-height)`,
    }),
    active: style('div')({
      ...activeRow,
      ...paddingVH(8, 0),
      lineHeight: `var(--line-height)`,
      background: 'rgba(255, 255, 255, 0.08)',
      color: '#eee',
      fontWeight: 'bold',
    })
  }),

  header: modstyl({
    normal: style('div')({
      ...row,
      ...paddingH(6),
      display: 'flex',
      alignItems: 'center',
      color: '#c7c7c7',
      background: 'var(--background-20)',
    }),
    active: style('div')({
      ...row,
      ...paddingH(6),
      color: '#fff',
      background: 'var(--background-b10)',
      fontWeight: 'normal',
    })
  }),

  important: modstyl({
    normal: style('div')({
      ...row,
      ...paddingH(8),
      color: '#ffd800',
      background: 'var(--background-50)',
    })
  }),

  group: style('div')(paddingH(4)),
}
