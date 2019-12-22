import { createGlobalMessenger, isUndefined } from './global'
import { GlobalMessenger, Listener, MessengerType } from './types'

let id = 0
function getId() {
  id++
  return id.toString()
}

let globalMessenger: GlobalMessenger

type ListenersMap<U> = { [K in keyof U]: Listener }

export function createMainThreadMessenger<
  MessagesToSend extends ListenersMap<MessagesToSend>,
  MessagesToListen extends ListenersMap<MessagesToListen>
>() {
  if (isUndefined(figma)) {
    throw Error('Attempted to create a messanger on wrong side.')
  }

  return createMessenger<MessagesToSend, MessagesToListen>(MessengerType.main)
}

export function createIframeMessenger<
  MessagesToSend extends ListenersMap<MessagesToSend>,
  MessagesToListen extends ListenersMap<MessagesToListen>
>() {
  return createMessenger<MessagesToSend, MessagesToListen>(MessengerType.iframe)
}

function createMessenger<
  MessagesToSend extends ListenersMap<MessagesToSend>,
  MessagesToListen extends ListenersMap<MessagesToListen>
>(type: MessengerType) {
  /**
   * IMPORTANT.
   * All messenger instances share same Global Messenger –
   * store for all listeners and original subscriber and receiver
   * to the messages from the other side (iframe/main).
   */
  globalMessenger = globalMessenger || createGlobalMessenger(type)

  const id = getId()

  function send<E extends keyof MessagesToSend>(
    message: Extract<E, string>
  ): void
  function send<E extends keyof MessagesToSend>(
    message: Extract<E, string>,
    ...args: Parameters<MessagesToSend[E]>
  ): void
  function send<E extends keyof MessagesToSend>(
    message: Extract<E, string>,
    ...args: Parameters<MessagesToSend[E]>
  ) {
    globalMessenger.sendMessage(message, args)
  }

  return {
    on<E extends keyof MessagesToListen>(
      message: Extract<E, string>,
      listener: MessagesToListen[E]
    ): void {
      globalMessenger.listeners.set(id, message, listener)
    },
    off<E extends keyof MessagesToListen>(
      message: Extract<E, string>,
      listener?: MessagesToListen[E]
    ) {
      globalMessenger.listeners.remove(id, message, listener)
    },
    send
  }
}
