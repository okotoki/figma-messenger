import { IListenersStore, Listener, MessengerType } from './types'

export const isUndefined = (val: any | undefined): val is undefined =>
  val === undefined

const isObject = (val: any): boolean => typeof val === 'object' && val !== null

function executeListeners(data: any, handlers: IListenersStore) {
  if (isUndefined(data) || !isObject(data) || !data.type) {
    return
  }

  data = data as { type: string; data: any[] | undefined }

  Object.keys(handlers).map(k => {
    if (handlers[k] && handlers[k][data.type]) {
      const cbs = handlers[k][data.type]
      if (!!cbs && !!cbs.length) {
        cbs.map(cb => (isUndefined(data.data) ? cb() : cb(...data.data)))
      }
    }
  })
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

function send(from: MessengerType, message: string, data: any) {
  const msg = {
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
    sendMessage(name: string, data: any) {
      send(type, name, data)
    },

    listeners: {
      get(id: string, name: string): Listener[] | undefined {
        if (
          isUndefined(listenersStore[id]) ||
          isUndefined(listenersStore[id][name])
        ) {
          return
        }

        return listenersStore[id][name.toString()]
      },

      set(id: string, name: string, cb: Listener): void {
        const e = name.toString()

        if (isUndefined(listenersStore[id])) {
          listenersStore[id] = {}
        }

        if (isUndefined(listenersStore[id][e])) {
          listenersStore[id][e] = []
        }

        listenersStore[id][e].push(cb)
      },

      remove(id: string, name: string, cb?: Listener) {
        const e = name.toString()

        if (
          isUndefined(listenersStore[id]) ||
          isUndefined(listenersStore[id][e])
        ) {
          return
        }

        if (!!cb) {
          listenersStore[id][e] = listenersStore[id][e].filter(x => x !== cb)
        } else {
          delete listenersStore[id][e]
        }
      }
    }
  }
}
