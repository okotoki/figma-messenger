import { Listener, ListenersStore, MessengerType } from './types'

export const isUndefined = (val: any | undefined): val is undefined =>
  val === undefined

const isObject = (val: any): boolean => typeof val === 'object' && val !== null

function executeListenersX(data: any | Message, handlers: ListenersStore) {
  if (isUndefined(data) || !isObject(data) || !data.message) {
    return
  }

  const d = data as Message

  Object.keys(handlers).forEach(id => {
    const h = handlers[id]
    if (isUndefined(h) || isUndefined(h.listeners[d.message])) {
      return
    }

    // Only call listeners if message is global, or names match
    if (
      (isUndefined(d.messengerName) && isUndefined(h.name)) ||
      d.messengerName === h.name
    ) {
      h.listeners[d.message].forEach(cb =>
        isUndefined(d.data) ? cb() : cb(...d.data)
      )
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

interface Message {
  messengerName: string | undefined
  message: string
  data: any[]
}

function send(
  from: MessengerType,
  messengerName: string | undefined,
  message: string,
  data: any[]
) {
  const msg: Message = {
    message,
    messengerName,
    data
  }

  if (from === MessengerType.main) {
    figma.ui.postMessage(msg)
  } else if (from === MessengerType.iframe) {
    parent.postMessage({ pluginMessage: msg }, '*')
  }
}

export function createGlobalMessenger(type: MessengerType) {
  const listenersStore: ListenersStore = {}

  const messageHandler = (data: any) => {
    executeListenersX(data, listenersStore)
  }

  listen(type, messageHandler)

  return {
    sendMessage(
      messengerName: string | undefined,
      message: string,
      data: any[]
    ) {
      send(type, messengerName, message, data)
    },

    addMessengerInstanceToStore(id: string, name?: string) {
      if (isUndefined(listenersStore[id])) {
        listenersStore[id] = {
          name,
          listeners: {}
        }
      }
    },

    addListener(id: string, message: string, cb: Listener): void {
      const l = listenersStore[id]

      if (isUndefined(l)) {
        throw Error(
          'Messenger instance not found in listeners store. Call addMessengerInstanceToStore first.'
        )
      }

      if (isUndefined(l.listeners[message])) {
        l.listeners[message] = []
      }

      l.listeners[message].push(cb)
    },

    removeListener(id: string, message: string, cb?: Listener) {
      const l = listenersStore[id]

      if (isUndefined(l)) {
        throw Error(
          'Messenger instance not found in listeners store. Call addMessengerInstanceToStore first.'
        )
      }

      if (isUndefined(l.listeners[message])) {
        return
      }

      if (!!cb) {
        l.listeners[message] = l.listeners[message].filter(x => x !== cb)
      } else {
        delete l.listeners[message]
      }
    }
  }
}
