import { IListenersStore, Listener, MessengerType } from './types'

function isUndefined(val: any | undefined): val is undefined {
  return val === undefined
}

function isObject(val: any): boolean {
  return typeof val === 'object' && val !== null
}

function executeListeners(data: any, handlers: IListenersStore) {
  if (
    isUndefined(data) ||
    !isObject(data) ||
    !data.type ||
    isUndefined(data.data)
  ) {
    return
  }

  Object.keys(handlers).map(k => {
    if (handlers[k] && handlers[k][data.type]) {
      const cbs = handlers[k][data.type]
      if (!!cbs && !!cbs.length) {
        // log(`Message received '${data.type}'`, data.data)
        cbs.map(cb => cb(...data.data))
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

function send(from: MessengerType, event: string, data: any) {
  const msg = {
    type: event,
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
    sendMessage(event: string, data: any) {
      send(type, event, data)
    },

    listeners: {
      get(id: string, event: string): Listener[] | undefined {
        if (
          isUndefined(listenersStore[id]) ||
          isUndefined(listenersStore[id][event])
        ) {
          return
        }

        return listenersStore[id][event.toString()]
      },

      set(id: string, event: string, cb: Listener): void {
        const e = event.toString()

        if (isUndefined(listenersStore[id])) {
          listenersStore[id] = {}
        }

        if (isUndefined(listenersStore[id][e])) {
          listenersStore[id][e] = []
        }

        listenersStore[id][e].push(cb)
      },

      remove(id: string, event: string, cb?: Listener) {
        const e = event.toString()

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
