import { createGlobalMessenger } from './global'

export enum MessengerType {
  iframe = 'iframe',
  main = 'main'
}

export type Listener = (...args: any[]) => void

export interface ListenersStore {
  [id: string]: {
    name?: string
    listeners: {
      [message: string]: Listener[]
    }
  }
}

export type GlobalMessenger = ReturnType<typeof createGlobalMessenger>
