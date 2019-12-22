import { createGlobalMessenger } from './global'
import { GlobalMessenger, Listener, MessengerType } from './types'

let id = 0
function getId() {
  id++
  return id.toString()
}

let globalMessenger: GlobalMessenger

export function createMainThreadMessenger<
  EventsToListen extends { [K in keyof EventsToListen]: Listener },
  EventsToSend extends { [K in keyof EventsToSend]: Listener }
>() {
  return createMessenger<EventsToListen, EventsToSend>(MessengerType.main)
}

export function createIframeMessenger<
  EventsToListen extends { [K in keyof EventsToListen]: Listener },
  EventsToSend extends { [K in keyof EventsToSend]: Listener }
>() {
  return createMessenger<EventsToListen, EventsToSend>(MessengerType.iframe)
}

function createMessenger<
  EventsToListen extends { [K in keyof EventsToListen]: Listener },
  EventsToSend extends { [K in keyof EventsToSend]: Listener }
>(type: MessengerType) {
  /**
   * IMPORTANT.
   * All messenger instances share same Global Messenger –
   * store for all listeners and original subscriber and receiver
   * to the events from the other side (iframe/main).
   */
  globalMessenger = globalMessenger || createGlobalMessenger(type)

  const id = getId()

  return {
    on<E extends keyof EventsToListen>(
      event: Extract<E, string>,
      listener: EventsToListen[E]
    ): void {
      globalMessenger.listeners.set(id, event, listener)
    },
    off<E extends keyof EventsToListen>(
      event: Extract<E, string>,
      listener?: EventsToListen[E]
    ) {
      globalMessenger.listeners.remove(id, event, listener)
    },
    send<E extends keyof EventsToSend>(
      event: Extract<E, string>,
      ...args: Parameters<EventsToSend[E]>
    ) {
      globalMessenger.sendMessage(event, args)
    }
  }
}
