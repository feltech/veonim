import { exists, getDirs, remove as removePath, configPath } from '../support/utils'
import { load as loadExtensions } from '../core/extensions-api'
import * as downloader from '../support/download'
import { call } from '../messaging/worker-client'
import { NotifyKind } from '../protocols/veonim'
import { join } from 'path'

const EXT_PATH = join(configPath, 'veonim', 'extensions')

interface Extension {
  name: string,
  user: string,
  repo: string,
  installed: boolean,
}

enum ExtensionKind {
  Github,
  VSCode,
}

const parseExtensionDefinition = (text: string) => {
  const isVscodeExt = text.toLowerCase().startsWith('vscode:extension')
  const [ , user = '', repo = '' ] = isVscodeExt
    ? (text.match(/^(?:vscode:extension\/)([^\.]+)\.(.*)/) || [])
    : (text.match(/^([^/]+)\/(.*)/) || [])

  return { user, repo, kind: isVscodeExt ? ExtensionKind.VSCode : ExtensionKind.Github }
}

const getExtensions = async (texts: string[]) => Promise.all(texts
  .map(parseExtensionDefinition)
  .map(async m => {
    const name = `${m.user}--${m.repo}`

    return {
      ...m,
      name,
      installed: await exists(join(EXT_PATH, name)),
    }
  }))

const removeExtraneous = async (extensions: Extension[]) => {
  const dirs = await getDirs(EXT_PATH)
  const extensionInstalled = (path: string) => extensions.some(e => e.name === path)
  const toRemove = dirs.filter(d => !extensionInstalled(d.name))

  toRemove.forEach(dir => removePath(dir.path))
}

export default async (extText: string[]) => {
  const extensions = await getExtensions(extText).catch()
  const extensionsNotInstalled = extensions.filter(ext => !ext.installed)
  if (!extensionsNotInstalled.length) return removeExtraneous(extensions)

  call.notify(`Found ${extensionsNotInstalled.length} extensions. Installing...`, NotifyKind.System)

  const installed = await Promise.all(extensions.map(e => {
    const isVscodeExt = e.kind === ExtensionKind.VSCode
    const destination = join(EXT_PATH, `${e.user}--${e.repo}`)
    const downloadUrl = isVscodeExt
      ? downloader.url.vscode(e.user, e.repo)
      : downloader.url.github(e.user, e.repo)

    return downloader.download(downloadUrl, destination)
  }))

  const installedOk = installed.filter(m => m).length
  const installedFail = installed.filter(m => !m).length

  if (installedOk) call.notify(`Installed ${installedOk} extensions!`, NotifyKind.Success)
  if (installedFail) call.notify(`Failed to install ${installedFail} extensions. See devtools console for more info.`, NotifyKind.Error)

  removeExtraneous(extensions)
  loadExtensions()
  downloader.dispose()
}
