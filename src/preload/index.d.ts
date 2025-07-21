import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI & {
      // Auto-updater methods
      checkForUpdates: () => Promise<void>
      installUpdate: () => Promise<void>
      getAppVersion: () => Promise<string>
      // Event handling
      on: (channel: string, listener: (...args: unknown[]) => void) => void
      removeListener: (channel: string, listener: (...args: unknown[]) => void) => void
    }
    api: unknown
  }
}
