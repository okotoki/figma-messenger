import { createGlobalMessenger } from './global'

export enum MessengerType {
  iframe = 'iframe',
  main = 'main'
}

export type Listener = (...args: any[]) => void

export interface IListeners {
  [message: string]: Listener[]
}

export interface IListenersStore {
  [id: string]: IListeners
}

export type GlobalMessenger = ReturnType<typeof createGlobalMessenger>
