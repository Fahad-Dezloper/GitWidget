/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="vite/client" />

interface ElectronAPI {
  process: any;
  openExternal: (url: string) => void;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (channel: string, func: (...args: any[]) => void) => void;
  openGitHubAuth: () => Promise<void>;
}

declare interface Window {
  electron: ElectronAPI;
}
