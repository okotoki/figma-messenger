import { IListenersStore, Listener, MessengerType } from './types'

export const isUndefined = (val: any | undefined): val is undefined =>
  val === undefined

const isObject = (val: any): boolean => typeof val === 'object' && val !== null

function executeListeners(data: any, handlers: IListenersStore) {
  if (isUndefined(data) || !isObject(data) || !data.type || !data.id) {
    return
  }

  data = data as { id: string; type: string; data: any[] | undefined }
  const key = data.id + data.type
  const cbs = handlers[key]
  if (!!cbs && !!cbs.length) {
    cbs.forEach(cb => (isUndefined(data.data) ? cb() : cb(...data.data)))
  }
}

function listen(to: MessengerType, executeListeners: (data: any) => void) {
  if (to === MessengerType.main) {
    figma.ui.onmessage = (data: any) => {
      executeListeners(data)
    }
  } else if (to === MessengerType.iframe) {
    onmessage = event => {
      const data = event.data.pluginMessage
      executeListeners(data)
    }
  }
}

function send(from: MessengerType, id: string, message: string, data: any) {
  const msg = {
    id,
    type: message,
    data
  }

  // log(`Send '${type}' to ${to}`, data)

  if (from === MessengerType.main) {
    figma.ui.postMessage(msg)
  } else if (from === MessengerType.iframe) {
    parent.postMessage({ pluginMessage: msg }, '*')
  }
}

export function createGlobalMessenger(type: MessengerType) {
  const listenersStore: IListenersStore = {}

  const messageHandler = (data: any) => {
    executeListeners(data, listenersStore)
  }

  listen(type, messageHandler)

  return {
    sendMessage(id: string, name: string, data: any) {
      send(type, id, name, data)
    },

    listeners: {
      get(id: string, name: string): Listener[] | undefined {
        const key = id + name

        if (isUndefined(listenersStore[key])) {
          return
        }

        return listenersStore[key]
      },

      set(id: string, name: string, cb: Listener): void {
        const key = id + name

        if (isUndefined(listenersStore[key])) {
          listenersStore[key] = []
        }

        listenersStore[key].push(cb)
      },

      remove(id: string, name: string, cb?: Listener) {
        const key = id + name

        if (isUndefined(listenersStore[key])) {
          return
        }

        if (!!cb) {
          listenersStore[key] = listenersStore[key].filter(x => x !== cb)
        } else {
          delete listenersStore[key]
        }
      }
    }
  }
}
