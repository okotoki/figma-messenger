import { createGlobalMessenger } from './global'

export enum MessengerType {
  iframe = 'iframe',
  main = 'main'
}

export type Listener = (...args: any[]) => void

export interface IListenersStore {
  [key: string]: Listener[]
}

export type GlobalMessenger = ReturnType<typeof createGlobalMessenger>
