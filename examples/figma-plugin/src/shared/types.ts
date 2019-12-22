export interface Layers {
  name: string
  id: string
}

/**
 * Messages to be sent from Iframe side, listeners on Main Thread side.
 */
export interface IframeToMain {
  unsubscribeFromIframeMessages(): void
  subscribeToIframeMessages(): void
  heyFromIframe(msg: string): void
}

/**
 * Messages to be sent from Main Thread side, listeners on Iframe side.
 */
export interface MainToIframe {
  selectionChanged(els: Layers[]): void
}
